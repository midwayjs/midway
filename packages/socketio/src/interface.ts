import * as SocketIO from 'socket.io';
import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

export type IMidwaySocketIOApplication = IMidwayApplication<IMidwaySocketIOContext> & {
  use(fn: (socket: IMidwaySocketIOContext, fn: (err?: any) => void) => void): SocketIO.Namespace;
} & SocketIO.Server;

export type IMidwaySocketIOConfigurationOptions = {
  port?: number;
  webServer?: HttpServer | HttpsServer;
  pubClient?: any;
  subClient?: any;
} & SocketIO.ServerOptions & IConfigurationOptions;

export type IMidwaySocketIOContext = SocketIO.Socket & IMidwayContext;

export type Application = IMidwaySocketIOApplication;

export type Context = IMidwaySocketIOContext;
