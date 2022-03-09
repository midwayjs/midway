import { is as typeis } from 'type-is';
import * as qs from 'querystring';
import { getWorkerContext, isWorkerEnvironment } from './util';
import { WorkerContext, EntryRequest } from './interface';

const kBody = Symbol.for('ctx#body');
const kHeaders = Symbol.for('ctx#headers');
const kQuery = Symbol.for('ctx#query');
const kPath = Symbol.for('ctx#path');

export class HTTPRequest {
  private readonly originEvent: Request;
  public bodyParsed;
  private readonly originContext: WorkerContext;

  constructor(request, bodyText, bodyParsed = false, entryReq: EntryRequest) {
    this.originEvent = request;
    this[kBody] = bodyText;
    this.bodyParsed = bodyParsed;
    this.originContext = getWorkerContext(entryReq);
  }

  getOriginEvent() {
    return this.originEvent;
  }

  getOriginContext() {
    return this.originContext;
  }

  get headers() {
    if (this[kHeaders] == null) {
      this[kHeaders] = isWorkerEnvironment
        ? Object.fromEntries(this.originEvent.headers.entries())
        : this.originEvent.headers;
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
