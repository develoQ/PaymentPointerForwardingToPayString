#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { AwsStack } from '../lib/aws-stack'

const app = new cdk.App()

// eslint-disable-next-line no-new
new AwsStack(app, `PaymentPointer-forwarding`, {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
})
