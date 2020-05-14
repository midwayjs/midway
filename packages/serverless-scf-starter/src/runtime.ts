import { ServerlessLightRuntime } from '@midwayjs/runtime-engine';
import { Application } from '@midwayjs/serverless-http-parser';
import { SCF } from '@midwayjs/faas-typings';

const isLocalEnv = () => {
  return (
    process.env.MIDWAY_SERVER_ENV === 'local' ||
    process.env.NODE_ENV === 'local'
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
    return (event: object = {}, context = {} as SCF.RequestContext) => {
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

    return this.respond.apply(this.respond, [
      event,
      context,
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

            if (ctx.body === null || ctx.body === 'undefined') {
              ctx.body = '';
              ctx.type = 'text';
              ctx.status = 204;
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

            return {
              isBase64Encoded: encoded,
              statusCode: ctx.status,
              headers: newHeader,
              body: ctx.body,
            };
          })
          .catch(err => {
            ctx.logger.error(err);
            return {
              isBase64Encoded: false,
              statusCode: 500,
              headers: {},
              body: isLocalEnv() ? err.stack : 'Internal Server Error',
            };
          });
      },
    ]);
  }

  async wrapperEventInvoker(handler, event: any, context: SCF.RequestContext) {
    // format context
    const newCtx = {
      logger: console,
      originContext: context,
    };
    const args = [newCtx, event];
    // 其他事件场景
    return this.invokeHandlerWrapper(context, async () => {
      if (!handler) {
        return this.defaultInvokeHandler(...args);
      }
      return handler.apply(handler, args);
    });
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}

  getApplication() {
    return this.app;
  }
}

function isHttpEvent(event): event is SCF.APIGatewayEvent {
  return event?.httpMethod && event?.headers && event?.requestContext;
}
