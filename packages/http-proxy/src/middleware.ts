import {
  Config,
  Logger,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { IMiddleware, IMidwayLogger } from '@midwayjs/core';
import { HttpProxyConfig, HttpProxyStrategy } from './interface';
import axios from 'axios';

@Middleware()
export class HttpProxyMiddleware implements IMiddleware<any, any> {
  @Config('httpProxy')
  httpProxy: HttpProxyConfig;

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
      if (proxy.ignoreHeaders?.[key] || ctx.header[key] === undefined) {
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
    delete reqHeaders['content-length'];
    const method = req.method.toUpperCase();

    const targetRes = res.res || res;
    const isStream = targetRes.on && targetRes.writable;

    const reqOptions: any = {
      method,
      url: url.href,
      headers: reqHeaders,
      responseType: isStream ? 'stream' : 'arrayBuffer',
      timeout: this.httpProxy.proxyTimeout || 0,
    };
    if (method === 'POST' || method === 'PUT') {
      reqOptions.data = req.body ?? ctx.request?.body;
      if (
        req.headers['content-type'] === 'application/x-www-form-urlencoded' &&
        typeof reqOptions.data !== 'string'
      ) {
        reqOptions.data = Object.keys(reqOptions.data)
          .map(
            key =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                reqOptions.data[key]
              )}`
          )
          .join('&');
      }
    }
    const proxyResponse = await axios(reqOptions).catch(err => {
      if (!err || !err.response) {
        throw err || new Error('proxy unknown error');
      }
      return err.response;
    });
    res.type = proxyResponse.headers['content-type'];
    const ignoreHeaders = {
      'transfer-encoding': true,
    };
    Object.keys(proxyResponse.headers).forEach(key => {
      if (ignoreHeaders[key.toLowerCase()]) {
        return;
      }
      res.set(key, proxyResponse.headers[key]);
    });
    res.status = proxyResponse.status;
    if (isStream) {
      await new Promise(resolve => {
        proxyResponse.data.on('finish', () => {
          if (targetRes.end) {
            targetRes.end();
          }
          resolve(void 0);
        });
        proxyResponse.data.pipe(targetRes);
      });
    } else {
      res.body = proxyResponse.data;
    }
  }

  getProxyList(url): undefined | { proxy: HttpProxyConfig; url: URL } {
    if (!this.httpProxy) {
      return;
    }
    this.httpProxy.default = this.httpProxy.default || {};
    const proxyList: HttpProxyStrategy[] = this.httpProxy.match
      ? [this.httpProxy]
      : this.httpProxy.strategy
      ? Object.values(this.httpProxy.strategy).map(item => {
          return Object.assign({}, this.httpProxy.default, item);
        })
      : [];

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
