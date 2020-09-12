import * as SocketIO from 'socket.io';
import { IMidwayApplication } from '@midwayjs/core';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

export type IMidwaySocketIOApplication = IMidwayApplication & SocketIO.Server;

export type IMidwaySocketIOConfigurationOptions = {
  port?: number;
  webServer?: HttpServer | HttpsServer;
} & SocketIO.ServerOptions;
