import {
  Config,
  Logger,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { IMiddleware, IMidwayLogger } from '@midwayjs/core';
import { HttpProxyConfig } from './interface';
import axios from 'axios';

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
    const proxyInfo = this.getProxyList(ctx.url);
    if (!proxyInfo) {
      return next();
    }
    const { proxy, url } = proxyInfo;
    const reqHeaders = {};
    for (const key of Object.keys(req.headers)) {
      if (proxy.ignoreHeaders?.[key]) {
        continue;
      }
      reqHeaders[key.toLowerCase()] = ctx.header[key];
    }
    // X-Forwarded-For
    const forwarded = req.headers['x-forwarded-for'];
    reqHeaders['x-forwarded-for'] = forwarded
      ? `${forwarded}, ${ctx.ip}`
      : ctx.ip;
    reqHeaders['host'] = url.host;

    const method = req.method.toUpperCase();

    const reqOptions = {
      method,
      url: url.href,
      headers: reqHeaders,
      responseType: 'arrayBuffer',
    };

    // if (method === 'POST' || method === 'PUT') {
    // } else {
    // }
    const proxyResponse = await axios(reqOptions as any);
    res.type = proxyResponse.headers['content-type'];
    Object.keys(proxyResponse.headers).forEach(key => {
      res.set(key, proxyResponse.headers[key]);
    });
    res.status = proxyResponse.status;
    res.body = proxyResponse.data;
  }

  getProxyList(url): undefined | { proxy: HttpProxyConfig; url: URL } {
    if (!this.httpProxy) {
      return;
    }
    const proxyList = [].concat(this.httpProxy);
    for (const proxy of proxyList) {
      if (!proxy.match) {
        continue;
      }
      if (!proxy.match.test(url)) {
        continue;
      }

      if (proxy.host) {
        if (url[0] === '/') {
          url = proxy.host + url;
        }

        const urlObj = new URL(url);
        return {
          proxy,
          url: urlObj,
        };
      } else if (proxy.target) {
        const newURL = url.replace(proxy.match, proxy.target);
        return {
          proxy,
          url: new URL(newURL),
        };
      }
    }
  }
}
