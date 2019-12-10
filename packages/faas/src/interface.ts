import { RequestContainer } from 'injection';

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
  body: object;
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

  get(key: string): string;

  set(key, value);

  type: string;
  status: FaaSHTTPResponse['statusCode'];
  body: FaaSHTTPResponse['body'];
}

export interface ServerlessInvokeOptipns {
  name: string;
  group: string;
  version?: string;
}

export interface ServerlessFunctionInvoker {
  invoke(invokeOpts: ServerlessInvokeOptipns, args: string);
}

export interface FaaSContext extends FaaSHTTPContext {
  logger: FaaSLogger;
  env: string;
  requestContext: RequestContainer;
  _originContext: any;
}

export interface MidwayFaaSInfo {
  baseDir: string;
  appDir: string;
}
