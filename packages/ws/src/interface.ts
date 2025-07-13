import * as WebSocket from 'ws';
import {
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction
} from '@midwayjs/core';
import type { IncomingMessage } from 'http';

export type IMidwayWSApplication = IMidwayApplication<IMidwayWSContext, {
  useConnectionMiddleware: (
    middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
  ) => void;
  getConnectionMiddleware: ContextMiddlewareManager<Context, NextFunction, undefined>;
  onWebSocketUpgrade: (handler: UpgradeAuthHandler | null) => void;
}> & WebSocket.Server;

export type IMidwayWSConfigurationOptions = {
  pubClient?: any;
  subClient?: any;
  /**
   * enable server heartbeat check, default is false
   */
  enableServerHeartbeatCheck?: boolean;
  /**
   * server heartbeat interval, default is 30000ms
   */
  serverHeartbeatInterval?: number;
} & Partial<WebSocket.ServerOptions> & IConfigurationOptions;

export type IMidwayWSContext = IMidwayContext<WebSocket & {
  app: IMidwayWSApplication;
  isAlive: boolean;
  request: IncomingMessage
}>;

export type Application = IMidwayWSApplication;
export type NextFunction = BaseNextFunction;
export interface Context extends IMidwayWSContext {}

/**
 * WebSocket 升级前鉴权处理函数类型
 */
export type UpgradeAuthHandler = (
  request: IncomingMessage,
  socket: any,
  head: Buffer
) => Promise<boolean>;
