import {
  Config,
  Logger,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { IMiddleware, IMidwayLogger } from '@midwayjs/core';
import { HttpProxyConfig } from './interface';

@Middleware()
export class HttpProxyMiddleware implements IMiddleware<any, any> {
  @Config('httpProxy')
  httpProxy: HttpProxyConfig | HttpProxyConfig[];


  @Logger()
  logger: IMidwayLogger;

  resolve(app) {

    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        return this.execProxy(req, req, res, next, true);
      };
    } else {
      return async (ctx, next) => {
        const req = ctx.request?.req || ctx.request;
        return this.execProxy(ctx, req, ctx, next, false);
      };
    }
  }

  async execProxy(ctx, req, res, next, isExpress) {
    const proxyList = this.getProxyList();
    const proxy = proxyList.find(proxy => {
      return !proxy.match || proxy.match.test(ctx.url);
    });
    console.log('proxy', proxy);
    return next();
  }

  getProxyList() {
    if (!this.httpProxy) {
      return []
    }
    return [].concat(this.httpProxy).filter((proxy: HttpProxyConfig) => {
      return proxy.host || proxy.target;
    });
  }
}
