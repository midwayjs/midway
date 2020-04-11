import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/54788.html
 */
export class ApiGatewayTrigger extends FCBaseTrigger {
  handler;

  async toArgs(): Promise<any[]> {
    const event = Object.assign(
      {
        path: 'api request path',
        httpMethod: 'request method name',
        headers: {},
        queryParameters: {},
        pathParameters: {},
        body: '',
        isBase64Encoded: 'false',
      },
      this.triggerOptions
    );

    return [event, this.createContext()];
  }
}

export const apigw = ApiGatewayTrigger;
