import { IConfigurationOptions, IMiddleware, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Application as ExpressApplication, NextFunction, Request, Response } from 'express';
import { RouterParamValue } from "@midwayjs/decorator";

export type IMidwayExpressContext = IMidwayContext<Request>;
export type IMidwayExpressMiddleware = IMiddleware<IMidwayExpressContext, Response, NextFunction>;
export type IMidwayExpressApplication = IMidwayApplication<IMidwayExpressContext, ExpressApplication & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): IMidwayExpressMiddleware;
  /**
   * @deprecated
   */
  generateMiddleware(middlewareId: string): Promise<IMidwayExpressMiddleware>;
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

export type Application = IMidwayExpressApplication;

export interface Context extends IMidwayExpressContext {}
