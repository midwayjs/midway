import {
  ServerlessLightRuntime,
  ContextExtensionHandler,
} from '@midwayjs/runtime-engine';
import { Application, HTTPResponse } from '@midwayjs/serverless-http-parser';
import { types } from 'util';
import { Readable, Writable } from 'stream';
import { HTTPRequest } from './http-request';
import { bufferFromStream, safeJSONParse } from './util';

const { isAnyArrayBuffer, isArrayBufferView } = types;

const isOutputError = () => {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
};

const isWorkerEnvironment =
  typeof ServiceWorkerGlobalScope === 'function' &&
  globalThis instanceof ServiceWorkerGlobalScope;

export class WorkerRuntime extends ServerlessLightRuntime {
  app: Application;
  respond;

  async init(contextExtensions: ContextExtensionHandler[]): Promise<void> {
    await super.init(contextExtensions);
    this.app = new Application();
  }

  /**
   * for handler wrapper
   * @param handler
   */
  asyncEvent(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }

    return (...req: EntryRequest) => {
      let request: Request | IncomingMessage;

      if (isWorkerEnvironment) {
        request = (req[0] as FetchEvent).request as Request;
      } else {
        request = req[1] as IncomingMessage;
      }

      const isEventRequest = request.method === EVENT_INVOKE_METHOD;

      if (isEventRequest) {
        return this.wrapperEventInvoker(handler, request, req);
      }

      return this.wrapperWebInvoker(handler, request, req);
    };
  }

  getApplication() {
    return this.app;
  }

  getFunctionName(): string {
    return this.options?.initContext?.function?.name || super.getFunctionName();
  }

  getFunctionServiceName(): string {
    return (
      this.options?.initContext?.service?.name || super.getFunctionServiceName()
    );
  }

  private async getRequestData(request: Request | IncomingMessage) {
    if (isWorkerEnvironment) {
      return (request as Request).text();
    } else {
      return bufferFromStream(request as IncomingMessage);
    }
  }

  private normalizeContext(
    request: Request | IncomingMessage
  ): Record<string, string> {
    const context: Record<string, string> = {};
    const headers = request.headers;

    Object.keys(headers).forEach(key => {
      context[key] = headers[key];
    });

    return context;
  }

  private responseEventSuccess(data: unknown, response: ServerResponse) {
    if (isWorkerEnvironment) {
      return data;
    } else {
      response.statusCode = 200;
      return response.end(data);
    }
  }

  private responseEventError(error: Error, response: ServerResponse) {
    const errorMsg = isOutputError() ? error.stack : 'Internal Server Error';

    if (isWorkerEnvironment) {
      return errorMsg;
    } else {
      response.statusCode = 500;
      response.end(errorMsg);
    }
  }

  async wrapperEventInvoker(
    handler,
    request: Request | IncomingMessage,
    entryReq: EntryRequest
  ) {
    let requestData = await this.getRequestData(request);

    if (Buffer.isBuffer(requestData)) {
      requestData = requestData.toString('utf8');
    }

    requestData = safeJSONParse(requestData);

    const context = this.normalizeContext(request);

    const newCtx = {
      logger: console,
      originEvent: requestData,
      originContext: context,
    };

    try {
      const result = await this.invokeHandlerWrapper(newCtx, async () => {
        try {
          if (!handler) {
            return await this.defaultInvokeHandler(newCtx);
          } else {
            return await handler.apply(handler, [newCtx]);
          }
        } catch (err) {
          newCtx.logger.error(err);

          throw err;
        }
      });

      return this.responseEventSuccess(
        result,
        (entryReq as NodeEntryRequest)[2]
      );
    } catch (error) {
      return this.responseEventError(error, (entryReq as NodeEntryRequest)[2]);
    }
  }

  private responseWebSuccess(
    data: Buffer | string,
    initOpts: ResponseInit,
    response: ServerResponse
  ) {
    if (isWorkerEnvironment) {
      return new Response(data, initOpts);
    } else {
      const headers = initOpts.headers;

      Object.keys(headers).forEach(key => {
        response.setHeader(key, headers[key]);
      });

      response.statusCode = initOpts.status ?? 200;
      response.end(data);
    }
  }

  private responseWebError(
    error: Error,
    initOpts: ResponseInit,
    response: ServerResponse
  ) {
    const errorMsg = isOutputError() ? error.stack : 'Internal Server Error';

    if (isWorkerEnvironment) {
      return new Response(errorMsg, initOpts);
    } else {
      response.statusCode = 500;
      response.end(errorMsg);
    }
  }

  async wrapperWebInvoker(
    handler,
    request: Request | IncomingMessage,
    entryReq: EntryRequest
  ) {
    if (this.respond == null) {
      this.respond = this.app.callback();
    }

    const url = new URL(request.url);
    let bodyParsed = false;
    let body = await this.getRequestData(request);

    if (url.protocol === 'event:') {
      // 阿里云无触发器，入参可能是 json
      if (Buffer.isBuffer(body)) {
        body = body.toString('utf8');
      }

      body = safeJSONParse(body);
      bodyParsed = true;
    }

    const koaReq = new HTTPRequest(request, body, bodyParsed);
    const koaRes = new HTTPResponse();

    return this.respond.apply(this.respond, [
      koaReq,
      koaRes,
      ctx => {
        return this.invokeHandlerWrapper(ctx, async () => {
          const args = [ctx];
          if (handler == null) {
            return this.defaultInvokeHandler(...args);
          }

          return handler(...args);
        })
          .then(result => {
            if (result) {
              ctx.body = result;
            }

            if (!ctx.response._explicitStatus) {
              if (ctx.body === null || ctx.body === 'undefined') {
                ctx.body = '';
                ctx.type = 'text';
                ctx.status = 204;
              }
            }

            let data = ctx.body;

            if (typeof data === 'string') {
              if (!ctx.type) {
                ctx.type = 'text/plain';
              }
            } else if (isAnyArrayBuffer(data) || isArrayBufferView(data)) {
              if (!ctx.type) {
                ctx.type = 'application/octet-stream';
              }
            } else if (typeof data === 'object') {
              if (!ctx.type) {
                ctx.type = 'application/json';
              }

              // set data to string
              data = JSON.stringify(data);
            } else {
              // 阿里云网关必须返回字符串
              if (!ctx.type) {
                ctx.type = 'text/plain';
              }

              // set data to string
              data = data + '';
            }

            const headers = {};

            for (const key in ctx.res.headers) {
              if (!['content-length'].includes(key)) {
                headers[key] = ctx.res.headers[key];
              }
            }

            return this.responseWebSuccess(
              data,
              {
                headers,
                status: ctx.status,
              },
              (entryReq as NodeEntryRequest)[2]
            );
          })
          .catch(err => {
            ctx.logger.error(err);

            return this.responseWebError(
              err,
              {
                status: err.status ?? 500,
              },
              (entryReq as NodeEntryRequest)[2]
            );
          });
      },
    ]);
  }
}

// Node.js environment: WorkerContext, IncomingMessage, OutgoingMessage
// Serverless worker environment: FetchEvent
type WorkerEntryRequest = FetchEvent[];
type NodeEntryRequest = [WorkerContext, IncomingMessage, ServerResponse];
type EntryRequest = WorkerEntryRequest | NodeEntryRequest;

export const EVENT_INVOKE_METHOD = 'alice-event-invoke';

export interface DaprResponse {
  status: number;
  json(): Promise<object>;
  text(): Promise<string>;
  buffer(): Promise<Buffer>;
}

export interface DaprInvokeOptions {
  app: string;
  methodName: string;
  data: Buffer;
}

export interface DaprBindingOptions {
  name: string;
  metadata: Record<string, string>;
  operation: string;
  data: Buffer;
}

export interface WorkerContext {
  Dapr: {
    ['1.0']: {
      invoke: (req: DaprInvokeOptions) => Promise<DaprResponse>;
      binding: (req: DaprBindingOptions) => Promise<DaprResponse>;
    };
  };
}

export interface IncomingMessage extends Readable {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly rawHeaders: string[];
}

export interface ServerResponse extends Writable {
  readonly headerSent: boolean;
  statusCode: number;
  readonly statusMessage: string;
  flushHeaders(): void;
  getHeader(name: string): string | string[];
  getHeaderNames(): string[];
  hasHeader(name: string): boolean;
  removeHeader(name: string): void;
  setHeader(name: string, value: string): void;
  writeHead(status: number, headers: Record<string, string> | string[]): void;
}
