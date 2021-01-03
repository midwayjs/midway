import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
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
  req: Request;
  res: Response;
  startTime: number;
}
export type IMidwayExpressApplication = IMidwayApplication & Application & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): Middleware;
};

export interface IMidwayExpressConfigurationOptions extends IConfigurationOptions {
  /**
   * application http port
   */
  port?: number;
  /**
   * https key
   */
  key?: string | Buffer | Array<Buffer | Object>;
  /**
   * https cert
   */
  cert?: string | Buffer | Array<string | Buffer>;
  /**
   * https ca
   */
  ca?: string | Buffer | Array<string | Buffer>;
}

export type MiddlewareParamArray = RequestHandler[];

export type Middleware = RequestHandler;

export interface IWebMiddleware {
  resolve(): Middleware;
}
