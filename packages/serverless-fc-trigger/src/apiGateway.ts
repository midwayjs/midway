import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/54788.html
 */
export class ApiGatewayTrigger extends FCBaseTrigger {
  handler;

  async toArgs(): Promise<any[]> {
    const event = Buffer.from(JSON.stringify(Object.assign(
      {
        path: this.triggerOptions.path || 'api request path',
        httpMethod: this.triggerOptions.method || 'request method name',
        headers: Object.assign({'X-Ca-Api-Gateway': 'test-id'}, this.triggerOptions.headers),
        queryParameters: this.triggerOptions.query || {},
        pathParameters: this.triggerOptions.pathParameters || {},
        body: this.triggerOptions.body || '',
        isBase64Encoded: false,
      }
    )));

    return [event, this.createContext()];
  }
}

export const apigw = ApiGatewayTrigger;
