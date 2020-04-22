import * as getType from 'cache-content-type';
import * as assert from 'assert';
import * as statuses from 'statuses';
import { is as typeis} from 'type-is';

export class Response {
  statusCode;
  explicitStatus;
  _body;
  _headers;

  constructor() {
    this.statusCode = 200;
    this._body = null;
    this._headers = {};
  }


  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */
  get header() {
    return this._headers;
  }

  /**
   * Return response header, alias as response.header
   *
   * @return {Object}
   * @api public
   */
  get headers() {
    return this.header;
  }

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */
  get body() {
    return this._body;
  }

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} val
   * @api public
   */
  set body(val) {
    this._body = val;

    // no content
    if (null == val) {
      if (!statuses.empty[this.status]) this.status = 204;
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // set the status
    if (!this.explicitStatus) this.status = 200;

    // set the content-type only if not yet set
    const setType = !this.has('Content-Type');

    // string
    if ('string' == typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // stream
    if ('function' == typeof val.pipe) {
      throw new Error('unsupport pipe value');
    }

    // json
    this.remove('Content-Length');
    this.type = 'json';
  }

  setHeader(name, value) {
    name = name.toLowerCase();
    this.headers[ name ] = value;
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

  /**
   * Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *     this.response.etag = 'md5hashsum';
   *     this.response.etag = '"md5hashsum"';
   *     this.response.etag = 'W/"123456789"';
   *
   * @param {String} etag
   * @api public
   */

  set etag(val) {
    if (!/^(W\/)?"/.test(val)) val = `"${val}"`;
    this.set('ETag', val);
  }

  /**
   * Get the ETag of a response.
   *
   * @return {String}
   * @api public
   */

  get etag() {
    return this.get('ETag');
  }

  /**
   * Returns true if the header identified by name is currently set in the outgoing headers.
   * The header name matching is case-insensitive.
   *
   * Examples:
   *
   *     this.has('Content-Type');
   *     // => true
   *
   *     this.get('content-type');
   *     // => true
   *
   * @param {String} field
   * @return {boolean}
   * @api public
   */
  has(field) {
    return this.hasHeader(field);
  }

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.set('Foo', ['bar', 'baz']);
   *    this.set('Accept', 'application/json');
   *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @param {String|Object|Array} field
   * @param {String} val
   * @api public
   */
  set(field, val?) {
    if (typeof field !== 'object') {
      if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v));
      else if (typeof val !== 'string') val = String(val);
      this.setHeader(field, val);
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
  }

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
   *
   * @param {String} field
   * @param {String|Array} val
   * @api public
   */

  append(field, val) {
    const prev = this.get(field);

    if (prev) {
      val = Array.isArray(prev)
        ? prev.concat(val)
        : [prev].concat(val);
    }

    return this.set(field, val);
  }

  /**
   * Return response header.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   * @param {String} field
   * @return {String}
   * @api public
   */

  get(field) {
    return this.getHeader(field);
  }

  set type(type) {
    type = getType(type);
    if (type) {
      this.set('Content-Type', type);
    } else {
      this.remove('Content-Type');
    }
  }

  get type() {
    const type = this.get('Content-Type');
    if (!type) {
      return '';
    }
    return type.split(';', 1)[0];
  }

  remove(field) {
    this.removeHeader(field);
  }

  get status() {
    return this.statusCode;
  }

  /**
   * Set response status code.
   *
   * @param {Number} code
   * @api public
   */

  set status(code) {
    assert(Number.isInteger(code), 'status code must be a number');
    assert(code >= 100 && code <= 999, `invalid status code: ${code}`);
    this.explicitStatus = true;
    this.statusCode = code;
    if (this.body && statuses.empty[code]) this.body = null;
  }

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */
  set length(n) {
    this.set('Content-Length', n);
  }

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */

  get length() {
    if (this.has('Content-Length')) {
      return parseInt(this.get('Content-Length'), 10) || 0;
    }

    const { body } = this;
    if (!body) return undefined;
    if ('string' === typeof body) return Buffer.byteLength(body);
    if (Buffer.isBuffer(body)) return body.length;
    return Buffer.byteLength(JSON.stringify(body));
  }

  /**
   * Set the Last-Modified date using a string or a Date.
   *
   *     this.response.lastModified = new Date();
   *     this.response.lastModified = '2013-09-13';
   *
   * @param {String|Date} type
   * @api public
   */

  set lastModified(val: Date) {
    if ('string' == typeof val) val = new Date(val);
    this.set('Last-Modified', val.toUTCString());
  }

  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   * @api public
   */

  get lastModified(): Date {
    const date = this.get('last-modified');
    if (date && typeof date === 'string') {
      return new Date(date);
    }
  }

  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `this.request.is()`.
   *
   * @param {String|String[]} [type]
   * @param {String[]} [types]
   * @return {String|false}
   * @api public
   */

  is(type, ...types) {
    return typeis(this.type, type, ...types);
  }

  end() {}
}
