import { Request } from './request';
import { Response } from './response';
import * as Cookies from 'cookies';
import {
  FaaSHTTPContext,
  FaaSHTTPRequest,
  FaaSHTTPResponse,
  FaaSOriginContext,
} from '@midwayjs/faas-typings';

const COOKIES = Symbol('context#cookies');

export class Context implements FaaSHTTPContext {
  private _req: FaaSHTTPRequest;
  private _res: FaaSHTTPResponse;
  private _originContext;
  private _originEvent;

  constructor(event, context) {
    this._req = new Request(event);
    this._res = new Response();
    this._originContext = context;
    this._originEvent = event;
  }

  /**
   * faas origin context object
   */
  get getOriginEvent(): FaaSOriginContext {
    return this._originEvent;
  }

  get originContext() {
    return this._originContext;
  }

  get req(): FaaSHTTPRequest {
    return this._req;
  }

  get res(): FaaSHTTPResponse {
    return this._res;
  }

  get request(): FaaSHTTPRequest {
    return this._req;
  }

  get response(): FaaSHTTPResponse {
    return this._res;
  }

  // req delegate
  get headers() {
    return this.req.headers;
  }

  get header() {
    return this.req.header;
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

  get params() {
    return this.req.pathParameters;
  }

  get host() {
    return this.req.host;
  }

  get hostname() {
    return this.req.hostname;
  }

  get(field) {
    return this.request.get(field);
  }

  // response delegate
  set type(value) {
    this.res.type = value;
  }

  get type() {
    return this.res.type;
  }

  set body(value) {
    this.res.body = value;
  }

  get body() {
    return this.res.body;
  }

  set status(code) {
    this.res.status = code;
  }

  get status() {
    return this.res.status;
  }

  set(key, value?) {
    this.res.set(key, value);
  }

  set etag(value) {
    this.res.etag = value;
  }

  set lastModified(value) {
    this.res.lastModified = value;
  }

  set length(value) {
    this.res.length = value;
  }

  get length() {
    return this.res.length;
  }

  get accept() {
    return this.req.accept;
  }

  is(type, ...types) {
    return this.request.is(type, ...types);
  }

  get cookies() {
    if (!this[COOKIES]) {
      const resProxy = new Proxy(this.res, {
        get(obj, prop) {
          // 这里屏蔽 set 方法，是因为 cookies 模块中根据这个方法获取 setHeader 方法
          if (prop !== 'set') {
            return obj[prop];
          }
        },
      });
      this[COOKIES] = new Cookies(this.req as any, resProxy as any, {
        keys: undefined,
        secure: false,
      });
    }
    return this[COOKIES];
  }

  set cookies(_cookies) {
    this[COOKIES] = _cookies;
  }

  append(field: string, val: string | string[]) {
    this.response.append(field, val);
  }

  remove(field: string): void {
    this.response.remove(field);
  }

  accepts(): boolean | string[];
  accepts(...types: string[]): string | boolean;
  accepts(types: string[]): string | boolean;
  accepts(...args): any {
    return this.request.accepts(...args);
  }

  acceptsEncodings(): boolean | string[];
  acceptsEncodings(...encodings: string[]): string | boolean;
  acceptsEncodings(encodings: string[]): string | boolean;
  acceptsEncodings(...args): any {
    return this.request.acceptsEncodings(...args);
  }

  acceptsCharsets(): boolean | string[];
  acceptsCharsets(...charsets: string[]): string | boolean;
  acceptsCharsets(charsets: string[]): string | boolean;
  acceptsCharsets(...args): any {
    return this.request.acceptsCharsets(...args);
  }

  acceptsLanguages(): boolean | string[];
  acceptsLanguages(...langs: string[]): string | boolean;
  acceptsLanguages(langs: string[]): string | boolean;
  acceptsLanguages(...args): any {
    return this.request.acceptsLanguages(...args);
  }
}
