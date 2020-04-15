import { MidwayRequestContainer } from '@midwayjs/core';
import { KoaMiddleware } from '@midwayjs/decorator';

export type Middleware = KoaMiddleware<FaaSContext>;

export interface IFaaSStarter {
  start(opts?);
  handleInvokeWrapper(handlerMapping: string);
}

export interface FunctionHandler {
  handler(...args);
}

export interface FaaSLogger {
  debug?(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log?(message?: any, ...optionalParams: any[]): void;
  warn?(message?: any, ...optionalParams: any[]): void;
  trace?(message?: any, ...optionalParams: any[]): void;
}

export interface FaaSHTTPRequest {
  path: string;
  method: string;
  headers: { [key: string]: string };
  query: { [key: string]: string };
  body: any;
  params: any;
}

export interface FaaSHTTPResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: any;
}

export interface FaaSHTTPContext {
  req: FaaSHTTPRequest;
  res: FaaSHTTPResponse;
  request: FaaSHTTPRequest;
  response: FaaSHTTPResponse;
  headers: FaaSHTTPRequest['headers'];
  method: FaaSHTTPRequest['method'];
  path: FaaSHTTPRequest['path'];
  query: FaaSHTTPRequest['query'];
  params: FaaSHTTPRequest['params'];

  get(key: string): string;

  set(key, value);

  type: string;
  status: FaaSHTTPResponse['statusCode'];
  body: FaaSHTTPResponse['body'];
}

export interface FaaSContext extends FaaSHTTPContext {
  logger: FaaSLogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
}

export interface MidwayFaaSInfo {
  baseDir: string;
  appDir: string;
}

export interface FC {
  APIGatewayEvent: {
    path: string;
    httpMethod: string;
    headers: object;
    queryParameters: object;
    pathParameters: object;
    body: string;
    isBase64Encoded: 'true' | 'false';
  };
  APIGatewayResponse: {
    isBase64Encoded: boolean;
    statusCode: number;
    headers: object;
    body: string;
  };
}
