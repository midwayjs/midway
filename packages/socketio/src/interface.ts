import * as SocketIO from 'socket.io';
import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

export type IMidwaySocketIOApplication = IMidwayApplication & {
  use(fn: (socket: IMidwaySocketIOContext, fn: (err?: any) => void) => void): SocketIO.Namespace;
} & SocketIO.Server;

export type IMidwaySocketIOConfigurationOptions = {
  port?: number;
  webServer?: HttpServer | HttpsServer;
} & SocketIO.ServerOptions;

export type IMidwaySocketIOContext = SocketIO.Socket & {
  requestContext: IMidwayContainer;
};
