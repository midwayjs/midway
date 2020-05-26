import { context } from './context';
import { request } from './request';
import { response } from './response';
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
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  /**
   * Initialize a new context.
   */
  createContext(req, res) {
    const context = Object.create(this.context);
    const request = (context.request = Object.create(this.request));
    const response = (context.response = Object.create(this.response));

    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
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

  use(fn: (...args) => Promise<void>) {
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
    return (req, res, respond) => {
      // if (!this.listenerCount('error')) this.on('error', this.onerror);
      const onerror = err => ctx.onerror(err);
      const ctx = this.createContext(req, res);
      return fn(ctx)
        .then(() => {
          return respond(ctx);
        })
        .catch(onerror);
    };
  }
}
