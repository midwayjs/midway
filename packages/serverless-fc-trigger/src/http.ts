import { exec } from 'child_process';
import * as express from 'express';
import * as HTTP from 'http';
import { FCBaseTrigger } from './base';

interface HTTPTriggerOpts {
  path: string;
  method: string;
  headers?: { [ key: string ]: any };
  query?: { [ key: string ]: any };
  body?: { [ key: string ]: any } | Buffer;
}

export class HTTPTrigger extends FCBaseTrigger {
  httpServer;
  app: express.Application;
  opts: HTTPTriggerOpts;
  handler: (err, result) => void;

  constructor(options?: HTTPTriggerOpts) {
    super();
    this.opts = options;
  }

  async delegate(invokeWrapper: (invokeArgs: any[]) => any) {
    if (!this.app) {
      this.app = express();
      this.app.get('*', (req, res, next) => {
        /**
         * function(request, response, context)
         */
        invokeWrapper([
          req,
          res,
          this.createContext(),
        ]);
        next();
      });
    }
    return this.app;
  }

  async toArgs(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        const app = express();
        this.httpServer = HTTP.createServer(app);

        app.get('*', (req, res, next) => {
          /**
           * function(request, response, context)
           */
          const resp = new Response(this, res);
          resolve([
            new Proxy(req, {
              get: (target, key) => {
                if (key in this.opts) {
                  return this.opts[ key ];
                }
                return target[ key ];
              },
            }),
            resp,
            this.createContext(),
          ]);
        });
      }

      this.httpServer.listen(0, err => {
        if (err) {
          reject(err);
        } else {
          exec(`curl 127.0.0.1:${this.httpServer.address().port}`, err => {
            if (err) {
              reject(err);
            }
          });
        }
      });
    });
  }

  createCallback(handler) {
    this.handler = handler;
    return err => {
      if (err) {
        throw err;
      }
    };
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close(err => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

class Response {
  statusCode: number;
  _headers;
  typeSetted;
  body;
  _res;
  trigger;
  _headersSent: boolean;

  constructor(trigger: HTTPTrigger, res) {
    this.trigger = trigger;
    this._res = res;

    this.statusCode = 200;
    this._headers = {
      'Content-Type': ['application/json; charset=utf-8'],
    };
    this.typeSetted = false;
    this.body = null;
  }

  get headers() {
    return this._headers;
  }

  set headers(json) {
    const keys = Object.keys(json);
    const map = {};
    for (const key of keys) {
      const item = json[ key ];
      if (Array.isArray(item)) {
        map[ key ] = item;
      } else {
        map[ key ] = [item];
      }
    }
    this._headers = map;
  }

  setHeader(key, value) {
    this._headers[ key ] = value;
  }

  send(data) {
    if (this._headersSent) {
      throw new Error('can not send multi times');
    }
    this.body = data;
    this._headersSent = true;
    this.trigger.handler(null, this.toJSON());
    this._res.end();
  }

  end(data) {
    this.send(data);
  }

  toJSON() {
    const headers = this.headers;
    let base64Encoded = false;
    let body;
    if (typeof this.body === 'string') {
      body = this.body;
    } else if (Buffer.isBuffer(this.body)) {
      body = this.body.toString('base64');
      base64Encoded = true;
    } else {
      body = JSON.stringify(this.body);
    }

    // Orignal data
    return {
      headers,
      statusCode: this.statusCode,
      body,
      base64Encoded,
    };
  }
}

export const http = HTTPTrigger;
