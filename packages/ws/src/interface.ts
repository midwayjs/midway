import * as WebSocket from 'ws';
import {
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction
} from '@midwayjs/core';

export type IMidwayWSApplication = IMidwayApplication<IMidwayWSContext, {
  useConnectionMiddleware: (
    middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
  ) => void;
  getConnectionMiddleware: ContextMiddlewareManager<Context, NextFunction, undefined>;
}> & WebSocket.Server;

export type IMidwayWSConfigurationOptions = {
  pubClient?: any;
  subClient?: any;
} & Partial<WebSocket.ServerOptions> & IConfigurationOptions;

export type IMidwayWSContext = IMidwayContext<WebSocket & {
  app: IMidwayWSApplication;
}>;

export type Application = IMidwayWSApplication;
export type NextFunction = BaseNextFunction;
export interface Context extends IMidwayWSContext {}
