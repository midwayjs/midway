import { FC } from './fc';
import { SCF } from './scf';
import { Cookies } from '@midwayjs/cookies';

interface ContextDelegatedRequest {
  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     this.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('html');
   *     // => "html"
   *     this.accepts('text/html');
   *     // => "text/html"
   *     this.accepts('json', 'text');
   *     // => "json"
   *     this.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('image/png');
   *     this.accepts('png');
   *     // => undefined
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   */
  accepts(): string[] | boolean;
  accepts(...types: string[]): string | boolean;
  accepts(types: string[]): string | boolean;

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   */
  acceptsEncodings(): string[] | boolean;
  acceptsEncodings(...encodings: string[]): string | boolean;
  acceptsEncodings(encodings: string[]): string | boolean;

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   */
  acceptsCharsets(): string[] | boolean;
  acceptsCharsets(...charsets: string[]): string | boolean;
  acceptsCharsets(charsets: string[]): string | boolean;

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   */
  acceptsLanguages(): string[] | boolean;
  acceptsLanguages(...langs: string[]): string | boolean;
  acceptsLanguages(langs: string[]): string | boolean;

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains any of the give mime `type`s.
   * If there is no request body, `null` is returned.
   * If there is no content type, `false` is returned.
   * Otherwise, it returns the first `type` that matches.
   *
   * Examples:
   *
   *     // With Content-Type: text/html; charset=utf-8
   *     this.is('html'); // => 'html'
   *     this.is('text/html'); // => 'text/html'
   *     this.is('text/*', 'application/json'); // => 'text/html'
   *
   *     // When Content-Type is application/json
   *     this.is('json', 'urlencoded'); // => 'json'
   *     this.is('application/json'); // => 'application/json'
   *     this.is('html', 'application/*'); // => 'application/json'
   *
   *     this.is('html'); // => false
   */
  // is(): string | boolean;
  is(...types: string[]): string | boolean;
  is(types: string[]): string | boolean;
  /**
   * Return request header. If the header is not set, will return an empty
   * string.
   *
   * The `Referrer` header field is special-cased, both `Referrer` and
   * `Referer` are interchangeable.
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
   */
  get(field: string): string;
  /**
   * Get parsed host from event
   */
  host: string;
  /**
   * Get parsed host from event
   */
  hostname: string;
  /**
   * Request remote address.
   */
  ip: string;
  /**
   * Get/Set request URL.
   */
  url: string;
  accept: any;
  /**
   * Get request pathname.
   */
  path: string;
  /**
   * Get request method.
   */
  method: string;
  /**
   * Return request header.
   */
  header: { [key: string]: string };
  /**
   * Return request header, alias as request.header
   */
  headers: { [key: string]: string };
  /**
   * Get parsed query-string.
   */
  query: { [key: string]: any };

  /**
   * Get parsed params
   */
  params: { [key: string]: string };
}

export interface FaaSHTTPRequest extends ContextDelegatedRequest {
  /**
   * Get parsed request body from event
   */
  body: any;
  /**
   * Get Parsed path parameters from event
   */
  pathParameters: any;
}

interface ContextDelegatedResponse {
  /**
   * Get/Set response status code.
   */
  status: number;
  /**
   * Get/Set response body.
   */
  body: any;

  /**
   * Return parsed response Content-Length when present.
   * Set Content-Length field to `n`.
   */
  length: number;

  /**
   * Return the response mime type void of
   * parameters such as "charset".
   *
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain a charset.
   *
   * Examples:
   *
   *     this.type = '.html';
   *     this.type = 'html';
   *     this.type = 'json';
   *     this.type = 'application/json';
   *     this.type = 'png';
   */
  type: string;

  /**
   * Get the Last-Modified date in Date form, if it exists.
   * Set the Last-Modified date using a string or a Date.
   *
   *     this.response.lastModified = new Date();
   *     this.response.lastModified = '2013-09-13';
   */
  lastModified: Date;

  /**
   * Get/Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *     this.response.etag = 'md5hashsum';
   *     this.response.etag = '"md5hashsum"';
   *     this.response.etag = 'W/"123456789"';
   *
   * @param {String} etag
   * @api public
   */
  etag: string;

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.set('Foo', ['bar', 'baz']);
   *    this.set('Accept', 'application/json');
   *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   */
  set(field: { [key: string]: string }): void;
  set(field: string, val: string | string[]): void;

  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   * ```
   * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   * this.append('Warning', '199 Miscellaneous warning');
   * ```
   */
  append(field: string, val: string | string[]): void;

  /**
   * Remove header `field`.
   */
  remove(field: string): void;
  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    this.redirect('back');
   *    this.redirect('back', '/index.html');
   *    this.redirect('/login');
   *    this.redirect('http://google.com');
   */
  redirect(url: string, alt?: string): void;
}

export interface FaaSHTTPResponse extends ContextDelegatedResponse {
  /**
   * Return response header.
   */
  header: { [key: string]: any };
  /**
   * Return response header, alias as response.header
   */
  headers: { [key: string]: any };
  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `this.request.is()`.
   *
   * @param {String|Array} types...
   * @return {String|false}
   * @api public
   */
  // is(): string;
  is(...types: string[]): string;
  is(types: string[]): string;
  /**
   * Return response header. If the header is not set, will return an empty
   * string.
   *
   * The `Referrer` header field is special-cased, both `Referrer` and
   * `Referer` are interchangeable.
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
   */
  get(field: string): string;
}

export interface FaaSHTTPContext
  extends ContextDelegatedRequest,
    ContextDelegatedResponse {
  /**
   * Alias to this.request
   */
  req: FaaSHTTPRequest;
  /**
   * Alias to this.Response
   */
  res: FaaSHTTPResponse;
  /**
   * FaaS http request object
   */
  request: FaaSHTTPRequest;
  /**
   * FaaS http response object
   */
  response: FaaSHTTPResponse;
  /**
   * FaaS original context object.
   */
  originContext: FaaSOriginContext;

  /**
   * FaaS original event object.
   */
  originEvent: Record<string, any>;
  /**
   * FaaS Cookies Object
   */
  cookies: Cookies;

  /**
   * Throw an error with `msg` and optional `status`
   * defaulting to 500. Note that these are user-level
   * errors, and the message may be exposed to the client.
   *
   *    this.throw(403)
   *    this.throw('name required', 400)
   *    this.throw(400, 'name required')
   *    this.throw('something exploded')
   *    this.throw(new Error('invalid'), 400);
   *    this.throw(400, new Error('invalid'));
   *
   * See: https://github.com/jshttp/http-errors
   */
  throw(
    message: string,
    code?: number,
    properties?: Record<string, unknown>
  ): never;
  throw(status: number): never;
  throw(...properties: Array<number | string | Record<string, unknown>>): never;
}

export type FaaSOriginContext = FC.RequestContext | SCF.RequestContext;
