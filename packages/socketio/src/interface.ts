import * as SocketIO from 'socket.io';
import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction
} from '@midwayjs/core';

export type Application = IMidwayApplication<Context, {
  use(fn: (socket: Context, fn: (err?: any) => void) => void): SocketIO.Namespace;
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
