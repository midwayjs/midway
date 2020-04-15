import { SCFHTTPEvent } from '@midwayjs/serverless-scf-starter';
import { SCFBaseTrigger } from './base';
import * as express from 'express';

/**
 * https://cloud.tencent.com/document/product/583/12513
 */
export class ApiGatewayTrigger extends SCFBaseTrigger {
  handler;

  app: express.Application;

  async delegate(invokeWrapper: (invokeArgs: any[]) => any) {
    if (!this.app) {
      this.app = express();
      this.app.get('*', (req, res, next) => {
        /**
         * function(request, response, context)
         */
        invokeWrapper([req, res, this.createContext()]);
        next();
      });
    }
    return this.app;
  }

  async toArgs() {
    const event: Partial<SCFHTTPEvent> = {
      headerParameters: {},
      headers: this.triggerOptions.headers || {},
      httpMethod: this.triggerOptions.method || 'request method name',
      path: this.triggerOptions.path || 'api request path',
      pathParameters: this.triggerOptions.pathParameters || {},
      queryString: this.triggerOptions.query || {},
      queryStringParameters: this.triggerOptions.query || {},
      body: this.triggerOptions.body,
      requestContext: {
        httpMethod: this.triggerOptions.method || 'request method name',
        identity: {},
        path: this.triggerOptions.path || 'api request path',
        serviceId: 'service-qcz3nag0',
        sourceIp: '42.120.74.90',
        stage: 'release',
        requestId: '',
      },
    };

    return [event, this.createContext()];
  }
}

export const apigw = ApiGatewayTrigger;
