import { SCF } from '@midwayjs/faas-typings';
import { SCFBaseTrigger } from './base';
import * as express from 'express';
import * as expressBodyParser from 'body-parser';

/**
 * https://cloud.tencent.com/document/product/583/12513
 */
export class ApiGatewayTrigger extends SCFBaseTrigger {
  app: express.Application;

  async delegate(invokeWrapper: (invokeArgs: any[]) => any) {
    if (!this.app) {
      this.app = express();
      this.app.use(expressBodyParser.urlencoded({ extended: false }));
      this.app.use(expressBodyParser.json());
      this.app.all('*', (req, res, next) => {
        /**
         * function(request, response, context)
         */

        const event: Partial<SCF.APIGatewayEvent> = {
          headerParameters: {
            Refer: '10.0.2.14',
          },
          headers: req.headers,
          httpMethod: req.method,
          path: req.path,
          pathParameters: {},
          queryString: req.query,
          queryStringParameters: req.query,
          body: JSON.stringify(req.body),
          requestContext: {
            httpMethod: req.method,
            identity: {
              secretId: 'abdcdxxxxxxxsdfs',
            },
            path: req.path,
            serviceId: 'service-qcz3nag0',
            sourceIp: '42.120.74.90',
            stage: 'release',
            requestId: '',
          },
        };

        invokeWrapper([event, this.createContext()]).then(
          (result: {
            isBase64Encoded: boolean;
            statusCode: number;
            headers: any;
            body: any;
          }) => {
            res.set(result.headers);
            res.status(result.statusCode);
            if (result.isBase64Encoded) {
              res.send(Buffer.from(result.body, 'base64'));
            } else {
              res.send(result.body);
            }
          }
        );
      });
    }
    return this.app;
  }

  async toArgs() {
    const event: Partial<SCF.APIGatewayEvent> = {
      headerParameters: {
        Refer: '10.0.2.14',
      },
      headers: this.triggerOptions.headers || {},
      httpMethod: this.triggerOptions.method || 'request method name',
      path: this.triggerOptions.path || 'api request path',
      pathParameters: this.triggerOptions.pathParameters || {},
      queryString: this.triggerOptions.query || {},
      queryStringParameters: this.triggerOptions.query || {},
      body: this.triggerOptions.body,
      requestContext: {
        httpMethod: this.triggerOptions.method || 'request method name',
        identity: {
          secretId: 'abdcdxxxxxxxsdfs',
        },
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
export const http = ApiGatewayTrigger;
