import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Application, Request, Response, RequestHandler } from 'express';

export type IMidwayExpressRequest = IMidwayContext & Request;
export type IMidwayExpressResponse = Response;
export type IMidwayExpressApplication = IMidwayApplication & Application;

export interface IMidwayExpressConfigurationOptions {
  port?: number;
}

export type MiddlewareParamArray = RequestHandler[];

export type Middleware = RequestHandler;

export interface WebMiddleware {
  resolve(): Middleware;
}
