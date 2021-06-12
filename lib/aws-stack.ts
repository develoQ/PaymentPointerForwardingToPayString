/* eslint-disable no-new */
import { CfnOutput, Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import { MethodLoggingLevel, LambdaRestApi } from '@aws-cdk/aws-apigateway'
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda'
import { Bucket } from '@aws-cdk/aws-s3'
import {  PolicyStatement } from '@aws-cdk/aws-iam'
import { AaaaRecord, ARecord, ARecordProps, HostedZone, RecordTarget } from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager'
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  HttpVersion,
  PriceClass,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront'
require('dotenv').config()

export class AwsStack extends Stack {
  private functionName: string
  private bucket: Bucket
  private lambdaFunction: Function
  private restApi: LambdaRestApi
  private distribution: CloudFrontWebDistribution

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    this.functionName = id
    const rootDomain = process.env.rootDomain || ''
    const deployDomain = `ilp.${rootDomain}`

    this.bucket = new Bucket(this, this.prefix() + '-bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const lambdaPolicy = new PolicyStatement()
    lambdaPolicy.addActions('s3:ListBucket')
    lambdaPolicy.addResources(this.bucket.bucketArn)

    this.lambdaFunction = new Function(this, this.prefix() + '-Function', {
      code: Code.fromAsset('dist'),
      handler: 'index.handler',
      memorySize: 128,
      runtime: Runtime.NODEJS_14_X,
    })

    this.restApi = new LambdaRestApi(this, this.stackName + '-RestApi', {
      restApiName: this.functionName + '-' + 'APIGateway',
      handler: this.lambdaFunction,
      proxy: true,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    })

    const zone = HostedZone.fromLookup(this, this.prefix() + '-baseZone', {
      domainName: deployDomain,
    })

    const cert = new DnsValidatedCertificate(this, this.prefix() + '-Certificate', {
      domainName: deployDomain,
      hostedZone: zone,
      region: 'us-east-1',
    })

    this.distribution = new CloudFrontWebDistribution(this, this.prefix() + '-cloudfront', {
      defaultRootObject: '/',
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      httpVersion: HttpVersion.HTTP2,
      priceClass: PriceClass.PRICE_CLASS_200,
      originConfigs: [
        {
          // ApiGateWay
          customOriginSource: {
            domainName: this.restApi.restApiId + '.execute-api.' + this.region + '.' + 'amazonaws.com',
            originPath: `/${this.restApi.deploymentStage.stageName}`,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              allowedMethods: CloudFrontAllowedMethods.ALL,
            },
          ],
        },
      ],
      // 独自ドメインを設定する場合に使用する
      viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {
        aliases: [deployDomain],
        securityPolicy: SecurityPolicyProtocol.TLS_V1,
        sslMethod: SSLMethod.SNI,
      }),
    })
    const propsForRoute53Records: ARecordProps = {
      zone,
      recordName: deployDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    }

    new ARecord(this, this.prefix() + '-ARecord', propsForRoute53Records)
    new AaaaRecord(this, this.prefix() + '-AaaaRecord', propsForRoute53Records)

    new CfnOutput(this, 'SiteUrl', {
      value: 'https://' + deployDomain,
    })
  }

  private prefix(): string {
    return this.functionName
  }
}
