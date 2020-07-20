import * as express from 'express';
import { FCBaseTrigger } from './base';
import * as expressBodyParser from "body-parser";

/**
 * https://help.aliyun.com/document_detail/54788.html
 */
export class ApiGatewayTrigger extends FCBaseTrigger {
  handler;
  app: express.Application;

  async delegate(invokeWrapper: (invokeArgs: any[]) => any) {
    if (!this.app) {
      this.app = express();
      this.app.use(expressBodyParser.urlencoded({ extended: false }));
      this.app.use(expressBodyParser.json());
      this.app.all('*', (req, res, next) => {
        const event = Buffer.from(
          JSON.stringify(
            Object.assign({
              path: req.path,
              httpMethod: req.method,
              headers: req.headers,
              queryParameters: req.query,
              pathParameters: {},
              body: JSON.stringify(req.body),
              isBase64Encoded: false,
            })
          )
        );
        invokeWrapper([event, this.createContext()]).then(
          (result: {
            isBase64Encoded: boolean;
            statusCode: number;
            headers: any;
            body: any;
          }) => {
            res.set(result.headers);
            res.status(result.statusCode).send(result.body);
          }
        );
      });
    }
    return this.app;
  }

  async toArgs(): Promise<any[]> {
    const event = Buffer.from(
      JSON.stringify(
        Object.assign({
          path: this.triggerOptions.path || 'api request path',
          httpMethod: this.triggerOptions.method || 'request method name',
          headers: Object.assign(
            { 'X-Ca-Timestamp': Date.now() },
            this.triggerOptions.headers
          ),
          queryParameters: this.triggerOptions.query || {},
          pathParameters: this.triggerOptions.pathParameters || {},
          body: this.triggerOptions.body || '',
          isBase64Encoded: false,
        })
      )
    );

    return [event, this.createContext()];
  }
}

export const apigw = ApiGatewayTrigger;
