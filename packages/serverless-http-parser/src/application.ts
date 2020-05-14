import { Context } from './context';
import { Request } from './request';
import { Response } from './response';
import * as compose from 'koa-compose';

export class Application {
  proxy = false;
  subdomainOffset = 2;
  proxyIpHeader = 'X-Forwarded-For';
  maxIpsCount = 0;
  middleware = [];
  keys;
  context;
  request;
  response;

  constructor(options?) {
    options = options || {};
    this.context = options?.context || Context;
    this.request = options?.request || Request;
    this.response = options?.response || Response;
  }

  /**
   * Initialize a new context.
   */
  createContext(event, faasContext) {
    const context = new this.context(event, faasContext);
    const request = new this.request(event);
    const response = new this.response();
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = request;
    context.res = request.res = response.res = response;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    // context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }

  /**
   * Use the given middleware `fn`.
   *
   * Old-style middleware will be converted.
   *
   * @param {Function} fn
   * @return {Application} self
   * @api public
   */

  use(fn: () => {}) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware must be a function!');
    this.middleware.push(fn);
    return this;
  }

  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   * @api public
   */

  callback() {
    const fn = compose(this.middleware);
    return (event, context, respond) => {
      // if (!this.listenerCount('error')) this.on('error', this.onerror);
      const onerror = err => ctx.onerror(err);
      const ctx = this.createContext(event, context);
      return fn(ctx)
        .then(() => {
          return respond(ctx);
        })
        .catch(onerror);
    };
  }
}
