import { BaseTrigger } from '@midwayjs/runtime-mock';
interface HTTPTriggerOpts {
  path: string;
  method: string;
  headers?: { [key: string]: any };
  query?: { [key: string]: any };
  body?: { [key: string]: any } | Buffer;
}

export class HTTPTrigger extends BaseTrigger {
  opts: HTTPTriggerOpts;
  useCallback = true;
  handler: any;

  constructor(options?: HTTPTriggerOpts) {
    super();
    this.opts = options;
  }

  async toArgs(): Promise<any[]> {
    const res = new Response({
      end: () => {
        this.handler(null, res.toJSON());
      },
    });
    const req = {
      ...this.opts,
      path: '',
      url: this.opts.path,
    };
    return [req, res];
  }

  createCallback(handler) {
    this.handler = handler;
    return err => {
      if (err) {
        throw err;
      }
    };
  }
}

class Response {
  statusCode: number;
  _headers;
  typeSetted;
  body;
  _res;
  _headersSent: boolean;

  constructor(res) {
    this._res = res;

    this.statusCode = 200;
    this._headers = {
      'content-type': 'application/json; charset=utf-8',
    };
    this.typeSetted = false;
    this.body = null;
  }

  get headers() {
    return this._headers;
  }

  setHeader(key, value) {
    this._headers[key] = value;
  }

  send(data) {
    if (this._headersSent) {
      throw new Error('can not send multi times');
    }
    this.body = data;
    this._headersSent = true;
    this._res.end();
  }

  status(statusCode) {
    this.statusCode = statusCode;
  }

  toJSON() {
    const headers = this.headers;
    let body;
    if (typeof this.body === 'string') {
      body = this.body;
    } else if (Buffer.isBuffer(this.body)) {
      body = this.body.toString();
      headers['content-type'] = 'application/octet-stream';
    } else {
      body = JSON.stringify(this.body);
      headers['content-type'] = 'application/json';
    }

    // Orignal data
    return {
      headers,
      statusCode: this.statusCode,
      body,
    };
  }
}

export const http = HTTPTrigger;
