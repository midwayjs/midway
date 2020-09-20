import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Application, Request, Response, RequestHandler, NextFunction } from 'express';
import { RouterParamValue } from "@midwayjs/decorator";

export type IMidwayExpressRequest = IMidwayContext & Request;
export type IMidwayExpressResponse = Response;
export type IMidwayExpressNext = NextFunction;
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

export interface IWebMiddleware {
  resolve(): Middleware;
}
