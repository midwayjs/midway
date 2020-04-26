import { is as typeis } from 'type-is';
import * as qs from 'querystring';
import * as accepts from 'accepts';
import { GatewayEvent } from './interface';
import { FaaSHTTPRequest } from '@midwayjs/faas-typings';

const EVENT = Symbol.for('ctx#event');
const EVENT_PARSED = Symbol.for('ctx#event_parsed');
const BODY = Symbol.for('ctx#body');

export class Request implements FaaSHTTPRequest {
  originEvent;
  _accept;
  private bodyParsed = false;

  constructor(event) {
    this.originEvent = event;
  }

  get host(): string {
    return this.get('host');
  }

  /**
   * Parse the "Host" header field hostname
   *
   * @return {String} hostname
   * @api public
   */

  get hostname() {
    const host = this.host;
    if (!host) return '';
    if ('[' == host[0]) return ''; // IPv6 not support
    return host.split(':', 1)[0];
  }

  accepts(...args) {
    return this.accept.types(...args);
  }

  get accept() {
    return this._accept || (this._accept = accepts(this as any));
  }

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
  }

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
  }

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
  }

  get [EVENT](): GatewayEvent {
    if (!this[EVENT_PARSED]) {
      this[EVENT_PARSED] =
        typeof this.originEvent === 'object'
          ? this.originEvent
          : JSON.parse(this.originEvent || '{}');
      const headers = {};
      Object.keys(this[EVENT_PARSED]['headers'] || {}).forEach((field) => {
        headers[field.toLowerCase()] = this[EVENT_PARSED]['headers'][field];
      });
      this[EVENT_PARSED]['headers'] = headers;
    }

    return this[EVENT_PARSED];
  }

  get ip() {
    return this[EVENT].clientIP || this[EVENT].requestContext?.sourceIp || '';
  }

  get url() {
    if (!this[EVENT].url) {
      const querystirng = qs.stringify(this.query || {});
      this[EVENT].url = this.path + (querystirng ? '?' + querystirng : '');
    }
    return this[EVENT].url;
  }

  get path() {
    return this[EVENT].path;
  }

  get pathParameters() {
    return this[EVENT].pathParameters || [];
  }

  get method() {
    return this[EVENT].method || this[EVENT].httpMethod;
  }

  get headers() {
    return this[EVENT].headers;
  }

  get header() {
    return this.headers;
  }

  get query() {
    return (
      this[EVENT].queries ||
      this[EVENT].queryParameters ||
      this[EVENT].queryString ||
      this[EVENT].queryStringParameters
    );
  }

  get body() {
    let body = this[EVENT].body;
    if (this[EVENT].isBase64Encoded === 'true') {
      return Buffer.from(body, 'base64').toString();
    }

    if (this.bodyParsed) {
      return this[BODY];
    }

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

    this.bodyParsed = true;
    return this[BODY];
  }

  is(type, ...types) {
    return typeis(type, ...types);
  }

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
  }
}
