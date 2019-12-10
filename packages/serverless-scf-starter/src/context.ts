import { SCFContext, SCFHTTPEvent } from './interface';

const ORIGIN_EVENT = Symbol.for('ctx#origin_event');
const EVENT = Symbol.for('ctx#event');
const EVENT_PARSED = Symbol.for('ctx#event_parsed');
const PARSED_EVENT = Symbol.for('ctx#parsed_body');
const BODY_PARSED = Symbol.for('ctx#body_parsed');
const BODY = Symbol.for('ctx#body');

export class Request {
  originEvent: SCFHTTPEvent;

  constructor(event: SCFHTTPEvent) {
    this.originEvent = event;
    this[ORIGIN_EVENT] = event;
    this[PARSED_EVENT] = null;
  }

  get [EVENT]() {
    if (!this[EVENT_PARSED]) {
      this[EVENT_PARSED] =
        typeof this[ORIGIN_EVENT] === 'object'
          ? this[ORIGIN_EVENT]
          : JSON.parse(this[ORIGIN_EVENT] || '{}');
      this[ORIGIN_EVENT] = null;
    }

    return this[EVENT_PARSED];
  }

  get ip() {
    return this[EVENT].requestContext.sourceIp;
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

    const originBody = this[EVENT].body;

    if (this[EVENT].isBase64Encoded) {
      this[BODY] = Buffer.from(originBody, 'base64').toString();
    } else if (typeof originBody === 'string') {
      try {
        this[BODY] = JSON.parse(originBody);
      } catch {
        this[BODY] = originBody;
      }
    } else {
      this[BODY] = originBody;
    }

    this[BODY_PARSED] = true;

    return this[BODY];
  }
}

export class Response {
  statusCode;
  headers;
  body;

  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
  }
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

  constructor(event: SCFHTTPEvent, context: SCFContext) {
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

  get ip() {
    return this.req.ip;
  }

  get url() {
    return this.req.url;
  }

  get(key) {
    return this.headers[key];
  }

  get queryStringParameters() {
    return this.req.queryStringParameters;
  }

  get headerParameters() {
    return this.req.headerParameters;
  }

  get pathParameters() {
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
