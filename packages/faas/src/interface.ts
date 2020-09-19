import { MidwayRequestContainer, IMidwayCoreApplication } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import type { MidwayHooks } from './hooks';
import { Middleware } from './middleware';

export interface IFaaSApplication extends IMidwayCoreApplication {
  getInitializeContext();
  use(middleware: Middleware<any>);
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
  hooks: MidwayHooks;
}
