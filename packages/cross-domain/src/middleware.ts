import {
  Config,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { CORSOptions } from './interface';
import * as vary from 'vary';
@Middleware()
export class CorsMiddleware implements IMiddleware<any, any> {
  @Config('cors')
  cors: CORSOptions;

  resolve(app) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        return this.compatibleMiddleware(req, res, next);
      };
    } else {
      return async (ctx, next) => {
        const req = ctx.request?.req || ctx.request;
        return this.compatibleMiddleware(req, ctx, next);
      };
    }

  }

  async compatibleMiddleware(request, response, next) {
    const requestOrigin = request.get('Origin');
    // Always set Vary header
    response.vary('Origin');

    if (!requestOrigin) {
      return await next();
    }

    let origin;
    if (typeof this.cors.origin === 'function') {
      origin = await Promise.resolve(this.cors.origin(request));
      if (!origin) {
        return await next();
      }
    } else {
      origin = this.cors.origin || requestOrigin;
    }

    let credentials;
    if (typeof this.cors.credentials === 'function') {
      credentials = await Promise.resolve(this.cors.credentials(request));
    } else {
      credentials = !!this.cors.credentials;
    }

    if (request.method.toUpperCase() === 'OPTIONS') {

      if (!request.get('Access-Control-Request-Method')) {
        return await next();
      }

      response.set('Access-Control-Allow-Origin', origin);

      if (credentials === true) {
        response.set('Access-Control-Allow-Credentials', 'true');
      }

      if (this.cors.maxAge) {
        response.set('Access-Control-Max-Age', this.cors.maxAge);
      }

      if (this.cors.allowMethods) {
        response.set('Access-Control-Allow-Methods', this.cors.allowMethods);
      }

      let allowHeaders = this.cors.allowHeaders;
      if (!allowHeaders) {
        allowHeaders = request.get('Access-Control-Request-Headers');
      }
      if (allowHeaders) {
        response.set('Access-Control-Allow-Headers', allowHeaders);
      }
      // default sattus is 204
      return;
    }
    const headersSet = {};

    function set(key, value) {
      response.set(key, value);
      headersSet[key] = value;
    }
    set('Access-Control-Allow-Origin', origin);

    if (credentials === true) {
      set('Access-Control-Allow-Credentials', 'true');
    }

    if (this.cors.exposeHeaders) {
      set('Access-Control-Expose-Headers', this.cors.exposeHeaders);
    }

    if (!this.cors.keepHeadersOnError) {
      return await next();
    }
    try {
      return await next();
    } catch (err) {
      const errHeadersSet = err.headers || {};
      const varyWithOrigin = vary.append(errHeadersSet.vary || errHeadersSet.Vary || '', 'Origin');
      delete errHeadersSet.Vary;

      err.headers = {
        ...errHeadersSet,
        ...headersSet,
        ...{ vary: varyWithOrigin },
      };
      throw err;
    }
  }
}