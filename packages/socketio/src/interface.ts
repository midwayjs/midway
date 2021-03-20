import * as SocketIO from 'socket.io';
import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';

export type IMidwaySocketIOApplication = IMidwayApplication<IMidwaySocketIOContext> & {
  use(fn: (socket: IMidwaySocketIOContext, fn: (err?: any) => void) => void): SocketIO.Namespace;
} & SocketIO.Server;

export type IMidwaySocketIOConfigurationOptions = {
  port?: number;
  pubClient?: any;
  subClient?: any;
} & Partial<SocketIO.ServerOptions> & IConfigurationOptions;

export type IMidwaySocketIOContext = SocketIO.Socket & IMidwayContext;

export type Application = IMidwaySocketIOApplication;

export interface Context extends IMidwaySocketIOContext {}
