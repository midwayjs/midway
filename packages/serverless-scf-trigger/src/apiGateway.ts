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
      headers: {
        'accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
        'connection': 'keep-alive',
        'host': 'service-qcz3nag0-1251881243.gz.apigw.tencentcs.com',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        'x-anonymous-consumer': 'true',
        'x-qualifier': '$LATEST',
      },
      httpMethod: 'GET',
      path: '/hellotest',
      pathParameters: {},
      queryString: {},
      queryStringParameters: {},
      requestContext: {
        httpMethod: 'ANY',
        identity: {},
        path: '/hellotest',
        serviceId: 'service-qcz3nag0',
        sourceIp: '42.120.74.90',
        stage: 'release',
        requestId: '',
      },
    };

    return [event, this.createContext()];
  }
}
