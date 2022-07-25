const { STATUS_CODES } = require('http');
const { Readable, Writable } = require('stream');

export class IncomingMessage extends Readable {
  #url;
  #method;
  #headers;

  constructor(metadataInit) {
    super({
      read() {},
    });
    this.#url = metadataInit.url;
    this.#method = metadataInit.method;
    this.#headers = metadataInit.headers;
  }

  get headers() {
    return Object.fromEntries(this.#headers);
  }

  get rawHeaders() {
    return this.#headers.flatMap(it => it);
  }

  get method() {
    return this.#method;
  }

  get url() {
    return this.#url;
  }
}

export class ServerResponse extends Writable {
  #headersSent = false;
  #headers = Object.create(null);
  #statusCode = 200;
  data;

  constructor() {
    super({
      write(chunk, encoding, callback) {
        if (!this.data) {
          this.data = chunk;
        } else {
          this.data = Buffer.concat([this.data, chunk]);
        }
        callback();
      },
      autoDestroy: true,
    });
  }

  flushHeaders() {
    this.writeHead(this.statusCode);
  }

  getHeader(name) {
    return this.#headers[name];
  }

  getHeaderNames() {
    return Object.keys(this.#headers);
  }

  getHeaders() {
    return {
      ...this.#headers,
    };
  }

  hasHeader(name) {
    return name in this.#headers;
  }

  get headersSent() {
    return this.#headersSent;
  }

  removeHeader(name) {
    delete this.#headers[name];
  }

  setHeader(name, value) {
    this.#headers[name] = value;
  }

  get statusCode() {
    return this.#statusCode;
  }

  set statusCode(val) {
    this.#statusCode = val;
  }

  get statusMessage() {
    return STATUS_CODES[this.#statusCode];
  }

  writeHead(statusCode, statusMessage?, headers?) {
    if (typeof statusMessage !== 'string') {
      headers = statusMessage;
      statusMessage = undefined;
    }
    this.statusCode = statusCode;

    if (Array.isArray(headers)) {
      if (headers.length % 2 !== 0) {
        throw new Error('headers is not valid');
      }

      let key;
      for (let n = 0; n < headers.length; n += 2) {
        key = headers[n + 0];
        if (key) this.setHeader(key, headers[n + 1]);
      }
    } else if (headers) {
      for (const [ key, val ] of Object.entries(headers)) {
        this.setHeader(key, val);
      }
    }
  }
}