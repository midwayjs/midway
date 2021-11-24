import {
  FAAS_ARGS_KEY,
  ServerlessLightRuntime,
} from '@midwayjs/runtime-engine';
import { AWSContext, AWSHTTPEvent } from './interface';
import {
  Application,
  HTTPRequest,
  HTTPResponse,
} from '@midwayjs/serverless-http-parser';

export class AWSRuntime extends ServerlessLightRuntime {
  app;
  respond;

  async init(): Promise<void> {
    this.app = new Application();
  }

  /**
   * for handler wrapper
   * @param handler
   */
  asyncEvent(handler) {
    if (handler.constructor.name !== 'AsyncFunction') {
      throw new TypeError('Must be an AsyncFunction');
    }
    return (event = {}, context?: AWSContext) => {
      if (isHttpEvent(event)) {
        return this.wrapperWebInvoker(handler, event, context);
      }
      return this.wrapperEventInvoker(handler, event, context);
    };
  }

  async wrapperWebInvoker(handler, event: AWSHTTPEvent, context: AWSContext) {
    if (!this.respond) {
      this.respond = this.app.callback();
    }
    const newReq = new HTTPRequest(event, context);
    const newRes = new HTTPResponse();

    return this.respond.apply(this.respond, [
      newReq,
      newRes,
      ctx => {
        return this.invokeHandlerWrapper(ctx, async () => {
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
          return handler.apply(handler, args);
        }).then(result => {
          if (result) {
            ctx.body = result;
          }
          const data = ctx.body;
          let encoded = false;
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
          }

          return {
            isBase64Encoded: encoded,
            statusCode: ctx.status,
            headers: ctx.res.headers,
            body: ctx.body,
          };
        });
      },
    ]);
  }

  async wrapperEventInvoker(handler, event: any, context: AWSContext) {
    const args = [context];
    if (event && event[FAAS_ARGS_KEY]) {
      args.push(event[FAAS_ARGS_KEY]);
    } else {
      args.push(event);
    }
    // 其他事件场景
    return this.invokeHandlerWrapper(context, async () => {
      return handler.apply(handler, args);
    });
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}

  getApplication() {
    return this.app;
  }

  getFunctionName(): string {
    // https://docs.aws.amazon.com/zh_cn/lambda/latest/dg/configuration-envvars.html
    return process.env.AWS_LAMBDA_FUNCTION_NAME || super.getFunctionName();
  }

  getFunctionServiceName(): string {
    // lambda 没有服务名
    return super.getFunctionServiceName();
  }
}

function isHttpEvent(event): event is AWSHTTPEvent {
  return event.httpMethod && event.headers && event.requestContext;
}
