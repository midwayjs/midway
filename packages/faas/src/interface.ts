import { MidwayRequestContainer, IMidwayCoreApplication } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';

export interface IFaaSApplication extends IMidwayCoreApplication {
  start(opts?);
  handleInvokeWrapper(handlerMapping: string);
  getInitializeContext();
  addGlobalMiddleware(mw: string);
}

/**
 * @deprecated same as IFaaSApplication
 */
export interface IFaaSStarter extends IFaaSApplication {}

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
