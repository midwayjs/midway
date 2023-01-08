import { is as typeis } from 'type-is';
import * as accepts from 'accepts';
import { FaaSOriginContext } from '@midwayjs/faas-typings';
import * as qs from 'querystring';
import * as only from 'only';
import { isPlainObject } from './util';

const BODY = Symbol.for('ctx#body');

export const request = {
  _accept: null,
  req: null,

  get host(): string {
    return this.get('host');
  },

  /**
   * Parse the "Host" header field hostname
   *
   * @return {String} hostname
   * @api public
   */

  get hostname() {
    const host = this.host;
    if (!host) return '';
    if ('[' === host[0]) return ''; // IPv6 not support
    return host.split(':', 1)[0];
  },

  accepts(...args) {
    return this.accept.types(...args);
  },

  get accept() {
    return this._accept || (this._accept = accepts(this as any));
  },

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {String|Array} encoding(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsEncodings(...args) {
    return this.accept.encodings(...args);
  },

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {String|Array} charset(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsCharsets(...args) {
    return this.accept.charsets(...args);
  },

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @param {String|Array} lang(s)...
   * @return {Array|String}
   * @api public
   */

  acceptsLanguages(...args) {
    return this.accept.languages(...args);
  },

  /**
   * faas origin context object
   */
  get originEvent() {
    return this.req.originEvent ?? this.req.getOriginEvent?.() ?? {};
  },

  get originContext(): FaaSOriginContext {
    return this.req.originContext ?? this.req.getOriginContext?.() ?? {};
  },

  get ip() {
    return this.req?.clientIP || this.req.ip;
  },

  get url() {
    return this.req.url;
  },

  get path() {
    return this.req.path;
  },

  set path(value) {
    this.req.path = value;
  },

  get method() {
    return this.req.method;
  },

  get headers() {
    return this.req.headers;
  },

  get header() {
    return this.req.headers;
  },

  get query() {
    return this.req?.queries || this.req.query;
  },

  get body() {
    const method = this.method.toLowerCase();
    if (['get', 'head', 'options'].includes(method)) {
      return undefined;
    }
    if (this[BODY]) {
      return this[BODY];
    }

    let body = this.req.body;
    if (isPlainObject(body)) {
      // body has been parsed in express environment
      this.req.bodyParsed = true;
    }

    if (this.req.bodyParsed) {
      // api 网关会被 parse，这里就直接返回了
      this[BODY] = this.req.body;
      return this[BODY];
    }

    // fc http parser 会走到这里，因为 req.body 是 buffer，且不会被处理
    if (Buffer.isBuffer(body)) {
      body = Buffer.from(body).toString();
    }

    switch (typeis(this.get('content-type'), ['urlencoded', 'json'])) {
      case 'json':
        try {
          this[BODY] = JSON.parse(body);
        } catch {
          throw new Error('invalid json received');
        }
        break;
      case 'urlencoded':
        try {
          this[BODY] = qs.parse(body);
        } catch {
          throw new Error('invalid urlencoded received');
        }
        break;
      default:
        this[BODY] = body;
    }

    return this[BODY];
  },

  get params() {
    return this.req.pathParameters || {};
  },

  is(type, ...types) {
    return typeis(this.get('content-type'), type, ...types);
  },

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   *     this.get('Something');
   *     // => ''
   *
   * @param {String} field
   * @return {String}
   * @api public
   */

  get(field) {
    switch ((field = field.toLowerCase())) {
      case 'referer':
      case 'referrer':
        return this.headers.referrer || this.headers.referer || '';
      default:
        return this.headers[field] || '';
    }
  },

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect() {
    if (!this.req) return;
    return this.toJSON();
  },

  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */

  toJSON() {
    return only(this, ['method', 'url', 'header']);
  },

  get protocol() {
    const proto = this.get('x-real-scheme') || this.get('X-Forwarded-Proto');
    return proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
  },

  /**
   * Short-hand for:
   *
   *    this.protocol == 'https'
   *
   * @return {Boolean}
   * @api public
   */

  get secure() {
    return this.protocol === 'https';
  },
};
