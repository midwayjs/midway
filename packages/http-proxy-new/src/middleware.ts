import {
  Logger,
  Middleware,
  IMiddleware,
  ILogger,
  IMidwayApplication,
} from '@midwayjs/core';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import * as c2k from 'koa2-connect';

@Middleware()
export class HttpProxyMiddleware implements IMiddleware<any, any> {
  @Logger()
  logger: ILogger;

  resolve(app: IMidwayApplication, proxyOptions: Options<any, any>) {
    if (!proxyOptions.logger) {
      proxyOptions.logger = this.logger;
    }
    if (app.getNamespace() === 'express') {
      return createProxyMiddleware<Request, Response>(proxyOptions);
    } else {
      return async function (ctx, next) {
        return await c2k(createProxyMiddleware<Request, Response>(proxyOptions))(ctx, next);
      }
    }
  }

  static getName() {
    return 'http-proxy-middleware';
  }
}
