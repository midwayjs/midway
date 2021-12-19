import { FaaSOriginContext } from '@midwayjs/faas-typings';
import * as util from 'util';
import * as createError from 'http-errors';
import { Cookies } from '@midwayjs/cookies';

const COOKIES = Symbol('context#cookies');

export const context = {
  app: null,
  req: null,
  res: null,
  request: null,
  response: null,

  /**
   * faas origin context object
   */
  get originEvent() {
    return this.request.originEvent;
  },

  get originContext(): FaaSOriginContext {
    return this.request.originContext;
  },

  // req delegate
  get headers() {
    return this.request.headers;
  },

  get header() {
    return this.request.headers;
  },

  get method() {
    return this.request.method;
  },

  get path() {
    return this.request.path;
  },

  set path(value) {
    this.request.path = value;
  },

  get query() {
    return this.request.query;
  },

  get ip() {
    return this.request.ip;
  },

  get url() {
    return this.request.url;
  },

  get params() {
    return this.request.params;
  },

  get host() {
    return this.request.host;
  },

  get hostname() {
    return this.request.hostname;
  },

  get(field) {
    return this.request.get(field);
  },

  // response delegate
  set type(value) {
    this.response.type = value;
  },

  get type() {
    return this.response.type;
  },

  set body(value) {
    this.response.body = value;
  },

  get body() {
    return this.response.body;
  },

  set status(code) {
    this.response.status = code;
  },

  get status() {
    return this.response.status;
  },

  set(key, value?) {
    this.response.set(key, value);
  },

  set etag(value) {
    this.response.etag = value;
  },

  get etag() {
    return this.response.etag;
  },

  set lastModified(value) {
    this.response.lastModified = value;
  },

  set length(value) {
    this.response.length = value;
  },

  get length() {
    return this.response.length;
  },

  get accept() {
    return this.request.accept;
  },

  get logger() {
    return (this.originContext as any).logger || console;
  },

  is(type, ...types) {
    return this.request.is(type, ...types);
  },

  append(field: string, val: string | string[]) {
    this.response.append(field, val);
  },

  remove(field: string): void {
    this.response.remove(field);
  },

  accepts(...args): any {
    return this.request.accepts(...args);
  },

  acceptsEncodings(...args): any {
    return this.request.acceptsEncodings(...args);
  },

  acceptsCharsets(...args): any {
    return this.request.acceptsCharsets(...args);
  },

  acceptsLanguages(...args): any {
    return this.request.acceptsLanguages(...args);
  },

  /**
   * Throw an error with `status` (default 500) and
   * `msg`. Note that these are user-level
   * errors, and the message may be exposed to the client.
   *
   *    this.throw(403)
   *    this.throw(400, 'name required')
   *    this.throw('something exploded')
   *    this.throw(new Error('invalid'))
   *    this.throw(400, new Error('invalid'))
   *
   * See: https://github.com/jshttp/http-errors
   *
   * Note: `status` should only be passed as the first parameter.
   *
   * @param {String|Number|Error} err, msg or status
   * @param {String|Number|Error} [err, msg or status]
   * @param {Object} [props]
   * @api public
   */

  throw(...args) {
    throw createError(...args);
  },

  onerror(err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (null == err) return;

    if (!(err instanceof Error))
      err = new Error(util.format('non-error thrown: %j', err));

    const { res } = this;

    // first unset all headers
    res.headers = {};

    // then set those specified
    this.set(err.headers);

    // force text/plain
    this.type = 'text';
    this.status = 500;

    // throw err and runtime will proxy this error
    throw err;
  },

  redirect(url: string, alt?: string) {
    return this.response.redirect(url, alt);
  },

  /**
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */
  vary(field) {
    return this.response.vary(field);
  },

  /**
   * util.inspect() implementation, which
   * just returns the JSON output.
   *
   * @return {Object}
   * @api public
   */

  inspect() {
    if (this === context) return this;
    return this.toJSON();
  },

  toJSON() {
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>',
    };
  },

  get cookies(): Cookies {
    if (!this[COOKIES]) {
      this[COOKIES] = new Cookies(this, this.app.keys, {
        secure: this.request.secure,
      });
    }
    return this[COOKIES];
  },

  set cookies(_cookies) {
    this[COOKIES] = _cookies;
  },
};
