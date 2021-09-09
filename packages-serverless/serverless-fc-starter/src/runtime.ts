import * as getRawBody from 'raw-body';
import {
  FAAS_ARGS_KEY,
  ServerlessLightRuntime,
} from '@midwayjs/runtime-engine';
import {
  Application,
  HTTPRequest,
  HTTPResponse,
} from '@midwayjs/serverless-http-parser';
import * as util from 'util';

const isOutputError = () => {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
};

export class FCRuntime extends ServerlessLightRuntime {
  app;
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
    if (handler && handler.constructor.name !== 'AsyncFunction') {
      throw new TypeError('Must be an AsyncFunction');
    }

    return (...args) => {
      const [req, res, context] = args;
      if (context) {
        return this.wrapperWebInvoker(handler, req, res, context);
      } else {
        return this.wrapperEventInvoker(handler, req, res);
      }
    };
  }

  async wrapperWebInvoker(handler, req, res, context) {
    // for web
    const isHTTPMode =
      req.constructor.name === 'IncomingMessage' ||
      req.constructor.name === 'EventEmitter' ||
      util.types.isProxy(req); // for local test

    if (!this.respond) {
      this.respond = this.app.callback();
    }

    let newReq = null;
    const newRes = new HTTPResponse();

    if (isHTTPMode) {
      req.getOriginContext = () => {
        return context;
      };
      // http
      // const rawBody = 'test';
      // req.rawBody = rawBody;

      // 如果需要解析body并且body是个stream
      if (
        ['post', 'put', 'delete'].indexOf(req.method.toLowerCase()) !== -1 &&
        !req.body &&
        typeof req.on === 'function'
      ) {
        req.body = await getRawBody(req, {
          limit: '10mb',
        });
      }
      newReq = req;
    } else {
      // api gateway
      newReq = new HTTPRequest(req, context);
    }

    // if (ctx.method === 'GET') {
    //   if (ctx.query && ctx.query[FAAS_ARGS_KEY]) {
    //     args.push(ctx.query[FAAS_ARGS_KEY]);
    //   }
    // } else if (ctx.method === 'POST') {
    //   if (ctx.req && ctx.req.body && ctx.req.body[FAAS_ARGS_KEY]) {
    //     args.push(ctx.req.body[FAAS_ARGS_KEY]);
    //   }
    // }

    return this.respond.apply(this.respond, [
      newReq,
      newRes,
      ctx => {
        return this.invokeHandlerWrapper(ctx, async () => {
          if (!handler) {
            const args = isHTTPMode ? [ctx] : [ctx, req];
            return this.defaultInvokeHandler(...args);
          }
          return handler.apply(handler, isHTTPMode ? [ctx] : [ctx, req]);
        })
          .then(result => {
            if (res.headersSent) {
              return;
            }

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

            let encoded = false;

            let data = ctx.body;
            if (typeof data === 'string') {
              if (!ctx.type) {
                ctx.type = 'text/plain';
              }
              ctx.body = data;
            } else if (Buffer.isBuffer(data)) {
              encoded = true;
              if (!ctx.type) {
                ctx.type = 'application/octet-stream';
              }

              // data is reserved as buffer
              ctx.body = data.toString('base64');
            } else if (typeof data === 'object') {
              if (!ctx.type) {
                ctx.type = 'application/json';
              }
              // set data to string
              ctx.body = data = JSON.stringify(data);
            } else {
              // 阿里云网关必须返回字符串
              if (!ctx.type) {
                ctx.type = 'text/plain';
              }
              // set data to string
              ctx.body = data = data + '';
            }

            const newHeader = {};

            for (const key in ctx.res.headers) {
              // The length after base64 is wrong.
              if (!['content-length'].includes(key)) {
                if ('set-cookie' === key && !isHTTPMode) {
                  // unsupport multiple cookie when use apiGateway
                  newHeader[key] = ctx.res.headers[key][0];
                  if (ctx.res.headers[key].length > 1) {
                    ctx.logger.warn(
                      '[fc-starter]: unsupport multiple cookie when use apiGateway'
                    );
                  }
                } else {
                  newHeader[key] = ctx.res.headers[key];
                }
              }
            }

            if (res.setHeader) {
              for (const key in newHeader) {
                res.setHeader(key, newHeader[key]);
              }
            }

            if (res.statusCode !== ctx.status) {
              if (res.setStatusCode) {
                res.setStatusCode(ctx.status);
              }

              if (res.statusCode) {
                res.statusCode = ctx.status;
              }
            }

            if (res.send) {
              // http trigger only support `Buffer` or a `string` or a `stream.Readable`
              res.send(data);
            }

            return {
              isBase64Encoded: encoded,
              statusCode: ctx.status,
              headers: newHeader,
              body: ctx.body,
            };
          })
          .catch(err => {
            ctx.logger.error(err);
            if (res.send) {
              res.setStatusCode(500);
              res.send(isOutputError() ? err.stack : 'Internal Server Error');
            }
            return {
              isBase64Encoded: false,
              statusCode: 500,
              headers: {},
              body: isOutputError() ? err.stack : 'Internal Server Error',
            };
          });
      },
    ]);
  }

  async wrapperEventInvoker(handler, event, context: any = {}) {
    const args = [context];
    if (event && event[FAAS_ARGS_KEY]) {
      args.push(event[FAAS_ARGS_KEY]);
    } else {
      // 阿里云无触发器，入参是 buffer
      if (Buffer.isBuffer(event)) {
        event = event.toString('utf8');
        try {
          event = JSON.parse(event);
        } catch (_err) {
          /** ignore */
        }
      }
      if (
        event &&
        event.headers &&
        'queryParameters' in event &&
        'httpMethod' in event
      ) {
        return this.wrapperWebInvoker(handler, event, {}, context);
      }
      args.push(event);
    }
    // format context
    const newCtx = {
      logger: context.logger || console,
      originEvent: event,
      originContext: context,
    };
    // 其他事件场景
    return this.invokeHandlerWrapper(newCtx, async () => {
      args[0] = newCtx;

      try {
        if (!handler) {
          return await this.defaultInvokeHandler(...args);
        } else {
          return await handler.apply(handler, args);
        }
      } catch (err) {
        newCtx.logger.error(err);
        if (isOutputError()) {
          throw err;
        } else {
          throw new Error('Internal Server Error');
        }
      }
    });
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
