import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Application as ExpressApplication, Request, Response, RequestHandler, NextFunction } from 'express';
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
export type IMidwayExpressContext = IMidwayContext<{
  req: Request;
  res: Response;
}>
export type IMidwayExpressApplication = IMidwayApplication<IMidwayExpressContext, ExpressApplication & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): Middleware;
  generateMiddleware(middlewareId: string): Promise<Middleware>;
}>;

export interface IMidwayExpressConfigurationOptions extends IConfigurationOptions {
  /**
   * application http port
   */
  port?: number;
  /**
   * application hostname, 127.0.0.1 as default
   */
  hostname?: string;
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
  /**
   * http2 support
   */
  http2?: boolean;
}

export type MiddlewareParamArray = RequestHandler[];

export type Middleware = RequestHandler;

export interface IWebMiddleware {
  resolve(): Middleware;
}

export type Application = IMidwayExpressApplication;

export interface Context extends IMidwayExpressContext {}
