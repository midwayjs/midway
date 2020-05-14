import { MidwayRequestContainer, IMidwayCoreApplication } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';

export interface IFaaSApplication extends IMidwayCoreApplication {
  getInitializeContext();
  use(
    middleware: (() => (context: any, next: () => Promise<any>) => any) | string
  );
  useMiddleware(mw: string[]);
}

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

export interface FaaSContext extends FaaSHTTPContext {
  logger: FaaSLogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
}
