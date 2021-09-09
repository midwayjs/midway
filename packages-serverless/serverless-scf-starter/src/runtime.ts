import { ServerlessLightRuntime } from '@midwayjs/runtime-engine';
import { SCF } from '@midwayjs/faas-typings';
import {
  Application,
  HTTPRequest,
  HTTPResponse,
} from '@midwayjs/serverless-http-parser';

const isOutputError = () => {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
};

export class SCFRuntime extends ServerlessLightRuntime {
  app;
  respond;

  init() {
    this.app = new Application();
  }

  /**
   * for handler wrapper
   * @param handler
   */
  asyncEvent(handler) {
    return (event = {}, context = {} as SCF.RequestContext) => {
      if (isHttpEvent(event)) {
        return this.wrapperWebInvoker(handler, event, context);
      }
      return this.wrapperEventInvoker(handler, event, context);
    };
  }

  async wrapperWebInvoker(
    handler,
    event: SCF.APIGatewayEvent,
    context: SCF.RequestContext
  ) {
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
          if (!handler) {
            return this.defaultInvokeHandler.apply(this, [ctx, event]);
          }
          return handler.apply(handler, [ctx, event]);
        })
          .then(result => {
            let encoded = false;
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

            const setContentType = (type: string) => {
              if (!ctx.type) {
                ctx.type = type;
              }
            };

            if (typeof ctx.body === 'string') {
              setContentType('text/plain');
            }

            if (Buffer.isBuffer(ctx.body)) {
              encoded = true;
              setContentType('application/octet-stream');
              ctx.body = ctx.body.toString('base64');
            } else if (typeof ctx.body === 'object') {
              setContentType('application/json');
              ctx.body = JSON.stringify(ctx.body);
            }

            const newHeader = {};
            for (const key in ctx.res.headers) {
              // The length after base64 is wrong.
              if (!['content-length'].includes(key)) {
                newHeader[key] = ctx.res.headers[key];
              }
            }

            // 不再等待事件循环
            // https://cloud.tencent.com/document/product/583/11060
            context.callbackWaitsForEmptyEventLoop = false;
            return {
              isBase64Encoded: encoded,
              statusCode: ctx.status,
              headers: newHeader,
              body: ctx.body,
            };
          })
          .catch(err => {
            ctx.logger.error(err);
            context.callbackWaitsForEmptyEventLoop = false;
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

  async wrapperEventInvoker(handler, event: any, context: SCF.RequestContext) {
    // format context
    const newCtx = {
      logger: console,
      originEvent: event,
      originContext: context,
    };
    const args = [newCtx, event];
    // 其他事件场景
    return this.invokeHandlerWrapper(context, async () => {
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

  async beforeInvokeHandler(context) { }

  async afterInvokeHandler(err, result, context) { }

  getApplication() {
    return this.app;
  }

  getFunctionName(): string {
    // https://cloud.tencent.com/document/product/583/30228
    return process.env.SCF_FUNCTIONNAME || super.getFunctionName();
  }

  getFunctionServiceName(): string {
    // 腾讯云没有服务名
    return super.getFunctionServiceName();
  }
}

function isHttpEvent(event): event is SCF.APIGatewayEvent {
  return event?.httpMethod && event?.headers && event?.requestContext;
}
