import { is as typeis } from 'type-is';
import * as qs from 'querystring';

const kBody = Symbol.for('ctx#body');
const kHeaders = Symbol.for('ctx#headers');
const kQuery = Symbol.for('ctx#query');
const kPath = Symbol.for('ctx#path');

export class HTTPRequest {
  private readonly originEvent: Request;
  public bodyParsed;

  constructor(request, bodyText, bodyParsed = false) {
    this.originEvent = request;
    this[kBody] = bodyText;
    this.bodyParsed = bodyParsed;
  }

  getOriginEvent() {
    return this.originEvent;
  }

  get headers() {
    if (this[kHeaders] == null) {
      this[kHeaders] = Object.fromEntries(this.originEvent.headers.entries());
    }
    return this[kHeaders];
  }

  get url() {
    return this.originEvent.url;
  }

  get path() {
    if (this[kPath] == null) {
      this[kPath] = new URL(this.url).pathname;
    }
    return this[kPath];
  }

  get method() {
    return this.originEvent.method;
  }

  get query() {
    if (this[kQuery] == null) {
      this[kQuery] = Object.fromEntries(
        new URL(this.url).searchParams.entries()
      );
    }
    return this[kQuery];
  }

  get body() {
    const method = this.method.toLowerCase();
    if (['get', 'head', 'options'].includes(method)) {
      return undefined;
    }
    if (this.bodyParsed) {
      return this[kBody];
    }

    const body = this[kBody];
    switch (typeis(this.getHeader('content-type'), ['urlencoded', 'json'])) {
      case 'json':
        try {
          this[kBody] = JSON.parse(body);
        } catch {
          throw new Error('invalid json received');
        }
        break;
      case 'urlencoded':
        try {
          this[kBody] = qs.parse(body);
        } catch (err) {
          throw new Error('invalid urlencoded received');
        }
        break;
      default:
        this[kBody] = body;
    }

    this.bodyParsed = true;
    return this[kBody];
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
