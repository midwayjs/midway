import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Application, Request, Response, RequestHandler } from 'express';
import { RouterParamValue } from "@midwayjs/decorator";

export type IMidwayExpressRequest = IMidwayContext & Request;
export type IMidwayExpressResponse = Response;
export type IMidwayExpressApplication = IMidwayApplication & Application & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): Middleware;
};

export interface IMidwayExpressConfigurationOptions {
  port?: number;
}

export type MiddlewareParamArray = RequestHandler[];

export type Middleware = RequestHandler;

export interface WebMiddleware {
  resolve(): Middleware;
}
