import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Application, Request, Response, RequestHandler, NextFunction } from 'express';
import { RouterParamValue } from "@midwayjs/decorator";

/**
 * @deprecated use Request from express
 */
export type IMidwayExpressRequest = Request;
/**
 * @deprecated use Response from express
 */
export type IMidwayExpressResponse = Response;
/**
 * @deprecated use NextFunction from express
 */
export type IMidwayExpressNext = NextFunction;
export type IMidwayExpressContext = IMidwayContext & {
  req: Request,
  res: Response,
}
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
