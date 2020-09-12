import * as SocketIO from 'socket.io';
import { IMidwayApplication } from '@midwayjs/core';

export type IMidwaySocketIOApplication = IMidwayApplication & SocketIO.Server;

export type IMidwaySocketIOConfigurationOptions = SocketIO.ServerOptions;
