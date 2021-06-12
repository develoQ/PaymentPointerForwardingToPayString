import serverlessExpress from '@vendia/serverless-express'
import { app as serverApp } from './app'

let app: any

exports.handler = (event: any, context: any, callback: any) => {
  if (!app) {
    const server = serverApp
    server.listen(3000, '0.0.0.0')
    app = serverlessExpress({ app: server })
  }
  return app(event, context, callback)
}
