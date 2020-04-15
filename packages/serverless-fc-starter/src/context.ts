import typeis = require('type-is');
import * as qs from 'querystring';

const ORIGIN_EVENT = Symbol.for('ctx#origin_event');
const EVENT = Symbol.for('ctx#event');
const EVENT_PARSED = Symbol.for('ctx#event_parsed');
const PARSED_EVENT = Symbol.for('ctx#parsed_body');
const BODY_PARSED = Symbol.for('ctx#body_parsed');
const BODY = Symbol.for('ctx#body');

export class Request {
  originEvent;

  constructor(event) {
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
    return this[EVENT].clientIP;
  }

  get url() {
    return this[EVENT].url;
  }

  get path() {
    return this[EVENT].path;
  }

  get pathParameters() {
    return this[EVENT].pathParameters;
  }

  get method() {
    return this[EVENT].method;
  }

  get headers() {
    return this[EVENT].headers;
  }

  get query() {
    return this[EVENT].queries;
  }

  get body() {
    let body = this[EVENT].body;
    if (this[EVENT].isBase64Encoded) {
      return Buffer.from(body, 'base64').toString();
    }

    if (this[BODY_PARSED]) {
      return this[BODY];
    }

    if (Buffer.isBuffer(body)) {
      body = Buffer.from(body).toString();
    }

    switch (typeis(this, ['urlencoded', 'json'])) {
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

    this[BODY_PARSED] = true;
    return this[BODY];
  }

  set body(val) {
    this[BODY] = val;
  }

  is(type, ...types) {
    return typeis(this, type, ...types);
  }
}

export class Response {
  statusCode;
  headers;
  typeSetted;
  body;

  constructor(res) {
    this.statusCode = 200;
    this.headers = {};
    this.typeSetted = false;
    this.body = null;
  }

  setHeader(key, value) {
    this.headers[key] = value;
  }

  end() {}
}

export class Context {
  req;
  request;
  res;
  response;
  statusCode;
  requestId;
  credentials;
  function;
  originContext: null;

  constructor(req, res, context) {
    this.req = this.request = new Request(req);
    this.res = this.response = new Response(res);
    this.requestId = context.requestId;
    this.credentials = context.credentials;
    this.function = context.function;
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

  get pathParameters() {
    return this.req.pathParameters;
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

  get params() {
    return this.req.pathParameters;
  }

  get(key) {
    return this.headers[key];
  }

  // response delegate
  set type(value) {
    this.res.typeSetted = true;
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
