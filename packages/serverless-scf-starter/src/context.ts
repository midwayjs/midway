import { SCFContext, SCFHTTPEvent } from './interface';
import * as qs from 'querystring';

const EVENT = Symbol.for('ctx#event');
const EVENT_PARSED = Symbol.for('ctx#event_parsed');
const PARSED_EVENT = Symbol.for('ctx#parsed_body');
const BODY_PARSED = Symbol.for('ctx#body_parsed');
const BODY = Symbol.for('ctx#body');

export class Request {
  originEvent: SCFHTTPEvent;

  constructor(event: SCFHTTPEvent) {
    this.originEvent = event;
    this[PARSED_EVENT] = null;
  }

  get [EVENT]() {
    if (!this[EVENT_PARSED]) {
      const parsedEvent =
        typeof this.originEvent === 'object'
          ? this.originEvent
          : JSON.parse(this.originEvent || '{}');

      this[EVENT_PARSED] = parsedEvent;
    }

    return this[EVENT_PARSED];
  }

  get ip() {
    return this[EVENT].requestContext?.sourceIp;
  }

  get url() {
    return this[EVENT].path;
  }

  get path() {
    return this[EVENT].path;
  }

  get method() {
    return this[EVENT].httpMethod;
  }

  get headers() {
    if (typeof this[EVENT].headers !== 'object') {
      this[EVENT].headers = {};
    }
    return this[EVENT].headers;
  }

  get query() {
    return this[EVENT].queryString;
  }

  get queryStringParameters() {
    return this[EVENT].queryStringParameters;
  }

  get headerParameters() {
    return this[EVENT].headerParameters;
  }

  get pathParameters() {
    return this[EVENT].pathParameters;
  }

  get body() {
    if (this[BODY_PARSED]) {
      return this[BODY];
    }

    const body = this[EVENT].body;

    switch (this.headers['content-type']) {
      case 'application/json':
        try {
          this[BODY] = JSON.parse(body);
        } catch {
          throw new Error('invalid json received');
        }
        break;
      case 'application/x-www-form-urlencoded':
        try {
          this[BODY] = qs.parse(body);
        } catch {
          throw new Error('invalid urlencoded received');
        }
        break;
      default:
        this[BODY] = body;
    }

    this[BODY_PARSED] = true;
    return this[BODY];
  }
}

export class Response {
  statusCode = 200;
  headers = {};
  body = null;

  setHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  end() {}
}

export class Context {
  req: Request;
  request: Request;
  res: Response;
  response: Response;
  statusCode;
  requestId;
  credentials = undefined;
  function;
  originContext: SCFContext;

  constructor(event, context: SCFContext) {
    this.req = this.request = new Request(event);
    this.res = this.response = new Response();
    this.requestId = context.request_id;
    this.function = context.function_name;
    this.originContext = context;
  }

  // req delegate
  get headers() {
    return this.req.headers;
  }

  get method() {
    return this.req.method;
  }

  get path() {
    return this.req.path;
  }

  get query() {
    return this.req.query;
  }

  get(key) {
    return this.headers[key];
  }

  get params() {
    return this.req.pathParameters;
  }

  // response delegate
  set type(value) {
    this.res.headers['content-type'] = value;
  }

  get type() {
    return this.res.headers['content-type'];
  }

  set body(value) {
    this.res.body = value;
  }

  get body() {
    return this.res.body;
  }

  set status(code) {
    this.res.statusCode = code;
  }

  get status() {
    return this.res.statusCode;
  }

  set(key, value) {
    this.res.headers[key] = value;
  }
}
