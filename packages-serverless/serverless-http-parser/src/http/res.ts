import { Writable } from 'stream';
import { HttpResponseOptions } from '../interface';
export class HTTPResponse extends Writable {
  constructor(readonly options: HttpResponseOptions = {}) {
    super();
    if (options.writeableImpl) {
      this.on('finish', () => {
        options.writeableImpl.end();
      });
    }
  }
  public statusCode = 200;
  public statusMessage;
  public headersSent = false;
  private _headers = {};

  get headers() {
    return this._headers;
  }

  set headers(value) {
    this._headers = value;
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

  setHeader(name, value) {
    name = name.toLowerCase();
    this.headers[name] = value;
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    if (!this.options.writeableImpl) {
      throw new Error('Current platform not support return value by stream.');
    }
    this.options.writeableImpl.write(chunk, encoding);
    callback();
  }

  end(cb?: () => void): this;
  end(chunk: any, cb?: () => void): this;
  end(chunk: any, encoding: BufferEncoding, cb?: () => void): this;
  end(chunk?: any, encoding?: any, cb?: any): this {
    if (!this.options.writeableImpl) {
      throw new Error('Current platform not support return value by stream.');
    }
    super.end(chunk, encoding, cb);
    return this;
  }
}
