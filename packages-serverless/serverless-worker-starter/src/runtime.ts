import { ServerlessLightRuntime } from '@midwayjs/runtime-engine';
import { Application, HTTPResponse } from '@midwayjs/serverless-http-parser';
import { types } from 'util';
import { HTTPRequest } from './http-request';

const { isAnyArrayBuffer, isArrayBufferView } = types;

const isOutputError = () => {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
};

export class WorkerRuntime extends ServerlessLightRuntime {
  app: Application;
  respond;

  init(contextExtensions) {
    super.init(contextExtensions);
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

    return event => {
      return this.wrapperWebInvoker(handler, event);
    };
  }

  async wrapperWebInvoker(handler, event: FetchEvent) {
    const { request } = event;
    const response: ResponseInit = {};

    if (this.respond == null) {
      this.respond = this.app.callback();
    }

    const bodyText = await request.text();

    const koaReq = new HTTPRequest(request, bodyText);
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
              ctx.body = data;
            } else if (isAnyArrayBuffer(data) || isArrayBufferView(data)) {
              if (!ctx.type) {
                ctx.type = 'application/octet-stream';
              }
              ctx.body = data;
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

            response.headers = headers;
            response.status = ctx.status;

            // http trigger only support `Buffer` or a `string` or a `stream.Readable`
            return new Response(data, response);
          })
          .catch(err => {
            ctx.logger.error(err);
            return new Response(
              isOutputError() ? err.stack : 'Internal Server Error',
              {
                status: 500,
              }
            );
          });
      },
    ]);
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}

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
}
