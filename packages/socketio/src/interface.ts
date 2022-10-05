import * as SocketIO from 'socket.io';
import {
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction
} from '@midwayjs/core';

export type Application = IMidwayApplication<Context, {
  use(fn: (socket: Context, fn: (err?: any) => void) => void): SocketIO.Namespace;
  useConnectionMiddleware: (
    middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
  ) => void;
  getConnectionMiddleware: ContextMiddlewareManager<Context, NextFunction, undefined>;
} & SocketIO.Server>;

export type IMidwaySocketIOOptions = {
  port?: number;
  pubClient?: any;
  subClient?: any;
} & Partial<SocketIO.ServerOptions> & IConfigurationOptions;

export type Context = IMidwayContext<SocketIO.Socket & {
  app: Application
}>;

export type NextFunction = BaseNextFunction;

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    socketIO?: IMidwaySocketIOOptions;
  }
}
