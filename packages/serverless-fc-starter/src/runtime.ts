import * as getRawBody from 'raw-body';
import {
  FAAS_ARGS_KEY,
  ServerlessLightRuntime,
} from '@midwayjs/runtime-engine';
import { Context } from './context';

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
    let ctx: any;
    // for web
    const isHTTPMode = req.constructor.name === 'EventEmitter';
    if (isHTTPMode) {
      // http
      const rawBody = await getRawBody(req);
      // const rawBody = 'test';
      // req.rawBody = rawBody;
      req.body = rawBody; // TODO: body parser
      ctx = new Context(req, res, context);
      ctx.EventType = 'fc_http';
    } else {
      // api gateway
      ctx = new Context(req, {}, context);
      ctx.EventType = 'fc_apigw';
    }

    const args = [ctx];

    if (ctx.method === 'GET') {
      if (ctx.query && ctx.query[FAAS_ARGS_KEY]) {
        args.push(ctx.query[FAAS_ARGS_KEY]);
      }
    } else if (ctx.method === 'POST') {
      if (ctx.req && ctx.req.body && ctx.req.body[FAAS_ARGS_KEY]) {
        args.push(ctx.req.body[FAAS_ARGS_KEY]);
      }
    }

    return this.invokeHandlerWrapper(ctx, async () => {
      if (!handler) {
        return this.defaultInvokeHandler.apply(this, args);
      }
      return handler.apply(handler, args);
    }).then(result => {
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

      if (res.setHeader) {
        for (const key in ctx.res.headers) {
          res.setHeader(key, ctx.res.headers[key]);
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
        headers: ctx.res.headers,
        body: ctx.body,
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
    // 其他事件场景
    return this.invokeHandlerWrapper(context, async () => {
      return handler.apply(handler, args);
    });
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}
}
