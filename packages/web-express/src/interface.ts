import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
// import { KoaMiddlewareParamArray } from '@midwayjs/decorator';
import { Application, Request, Response, IRouterHandler } from 'express';

export type IMidwayExpressRequest = IMidwayContext & Request;
export type IMidwayExpressResponse = Response;
export type IMidwayExpressApplication = IMidwayApplication & Application;

export interface IMidwayExpressConfigurationOptions {
  port?: number;
}

// export type MiddlewareParamArray = KoaMiddlewareParamArray<IMidwayKoaContext>;

export interface WebMiddleware<T> {
  resolve(): IRouterHandler<T>;
}
