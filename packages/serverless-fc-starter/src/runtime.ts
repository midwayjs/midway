import * as getRawBody from 'raw-body';
import {
  FAAS_ARGS_KEY,
  ServerlessLightRuntime,
} from '@midwayjs/runtime-engine';
import { Context } from '@midwayjs/serverless-http-parser';
import * as util from 'util';

const isLocalEnv = () => {
  return (
    process.env.MIDWAY_SERVER_ENV === 'local' ||
    process.env.NODE_ENV === 'local'
  );
};

export class FCRuntime extends ServerlessLightRuntime {
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
    let ctx: Context & { logger?: any };
    const args = [];
    // for web
    const isHTTPMode =
      req.constructor.name === 'EventEmitter' || util.types.isProxy(req); // for local test
    if (isHTTPMode) {
      // http
      // const rawBody = 'test';
      // req.rawBody = rawBody;
      req.body = await getRawBody(req); // TODO: body parser
      ctx = new Context(req, context);
      ctx.logger = context.logger || console;
      // ctx.EventType = 'fc_http';
      args.push(ctx);
    } else {
      // api gateway
      ctx = new Context(req, context);
      ctx.logger = context.logger || console;
      // ctx.EventType = 'fc_apigw';
      args.push(ctx);
      // Pass original event
      args.push(req);
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

    return this.invokeHandlerWrapper(ctx, async () => {
      if (!handler) {
        return this.defaultInvokeHandler.apply(this, args);
      }
      return handler.apply(handler, args);
    })
      .then((result) => {
        if (res.headersSent) {
          return;
        }

        if (result) {
          ctx.body = result;
        }

        let encoded = false;
        if (!isHTTPMode) {
          const data = ctx.body;
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
            ctx.body = data.toString('base64');
          } else if (typeof data === 'object') {
            if (!ctx.type) {
              ctx.type = 'application/json';
            }
            ctx.body = JSON.stringify(data);
          } else {
            // 阿里云网关必须返回字符串
            if (!ctx.type) {
              ctx.type = 'text/plain';
            }
            ctx.body = data + '';
          }
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
                  `[fc-starter]: unsupport multiple cookie when use apiGateway`
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

        if (res.setStatusCode) {
          res.setStatusCode(ctx.status);
        }

        if (res.send) {
          res.send(ctx.body);
        }

        return {
          isBase64Encoded: encoded,
          statusCode: ctx.status,
          headers: newHeader,
          body: ctx.body,
        };
      })
      .catch((err) => {
        ctx.logger.error(err);
        if (res.send) {
          res.setStatusCode(500);
          res.send(isLocalEnv() ? err.stack : 'Internal Server Error');
        }
        return {
          isBase64Encoded: false,
          statusCode: 500,
          headers: {},
          body: isLocalEnv() ? err.stack : 'Internal Server Error',
        };
      });
  }

  async wrapperEventInvoker(handler, event, context) {
    const args = [context];
    if (event && event[FAAS_ARGS_KEY]) {
      args.push(event[FAAS_ARGS_KEY]);
    } else {
      // 阿里云无触发器，入参是 buffer
      if (Buffer.isBuffer(event)) {
        event = event.toString('utf8');
        try {
          event = JSON.parse(event);
        } catch (_err) {}
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
      originContext: context,
    };
    // 其他事件场景
    return this.invokeHandlerWrapper(newCtx, async () => {
      return handler.apply(handler, args);
    });
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}
}
