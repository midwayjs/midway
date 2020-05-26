import { FaaSOriginContext } from '@midwayjs/faas-typings';
import { is as typeis } from 'type-is';
import * as qs from 'querystring';
import { GatewayEvent } from '../interface';

const EVENT = Symbol.for('ctx#event');
const EVENT_PARSED = Symbol.for('ctx#event_parsed');
const BODY = Symbol.for('ctx#body');

export class HTTPRequest {
  private originContext;
  private originEvent;
  public bodyParsed = false;

  constructor(event, context) {
    this.originEvent = event;
    this.originContext = context;
  }

  get [EVENT](): GatewayEvent {
    if (!this[EVENT_PARSED]) {
      this[EVENT_PARSED] =
        typeof this.originEvent === 'object'
          ? this.originEvent
          : JSON.parse(this.originEvent || '{}');
      const headers = {};
      Object.keys(this[EVENT_PARSED]['headers'] || {}).forEach(field => {
        headers[field.toLowerCase()] = this[EVENT_PARSED]['headers'][field];
      });
      this[EVENT_PARSED]['headers'] = headers;
    }

    return this[EVENT_PARSED];
  }

  /**
   * faas origin context object
   */
  getOriginEvent() {
    return this.originEvent;
  }

  getOriginContext(): FaaSOriginContext {
    return this.originContext;
  }

  get headers() {
    return this[EVENT].headers;
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
    return this[EVENT].pathParameters || {};
  }

  get method() {
    return this[EVENT].method || this[EVENT].httpMethod;
  }

  get query() {
    return (
      this[EVENT].queries ||
      this[EVENT].queryParameters ||
      this[EVENT].queryString ||
      this[EVENT].queryStringParameters
    );
  }

  get ip() {
    return this[EVENT].clientIP || this[EVENT].requestContext?.sourceIp || '';
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

    switch (typeis(this.getHeader('content-type'), ['urlencoded', 'json'])) {
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

  getHeader(field) {
    return this.headers[field.toLowerCase()] || '';
  }

  removeHeader(field) {
    delete this.headers[field.toLowerCase()];
  }

  hasHeader(field) {
    return field.toLowerCase() in this.headers;
  }
}
