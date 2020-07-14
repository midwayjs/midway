import { context } from './context';
import { request } from './request';
import { response } from './response';
import * as compose from 'koa-compose';
import * as only from 'only';
import { EventEmitter } from 'events';
import { format } from 'util';

export class Application extends EventEmitter {
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
    super();
    options = options || {};
    this.context = Object.create(options.context || context);
    this.request = Object.create(options.request || request);
    this.response = Object.create(options.response || response);
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
    this.on('error', this.onerror);
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

  /**
   * Return JSON representation.
   * We only bother showing settings.
   *
   * @return {Object}
   * @api public
   */

  toJSON() {
    return only(this, ['subdomainOffset', 'proxy', 'env']);
  }

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect() {
    return this.toJSON();
  }

  /**
   * Default error handler.
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
    if (!(err instanceof Error))
      throw new TypeError(format('non-error thrown: %j', err));
    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
}
