import { IConfigurationOptions } from '@midwayjs/core';
import { Hono } from 'hono';
import { Context as HonoContext, Next } from 'hono';
import { Server } from 'node:http';

export type Context = HonoContext & {
  requestContext?: any;
  requestBody?: any;
};

export type IMidwayHonoApplication = Hono;

export interface IMidwayHonoConfigurationOptions extends IConfigurationOptions {
  port?: number;
  hostname?: string;
  globalPrefix?: string;
}

export type Application = IMidwayHonoApplication;
export type HonoNext = Next;
export type HonoServer = Server;
