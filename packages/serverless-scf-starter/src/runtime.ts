import { ServerlessLightRuntime } from '@midwayjs/runtime-engine';
import { Context } from '@midwayjs/serverless-http-parser';
import { SCF } from '@midwayjs/faas-typings';

export class SCFRuntime extends ServerlessLightRuntime {
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
    const ctx: Context & { logger?: any } = new Context(event, context);
    ctx.logger = console;
    const args = [ctx, event];

    const result = await this.invokeHandlerWrapper(context, async () => {
      if (!handler) {
        return this.defaultInvokeHandler.apply(this, args);
      }
      return handler.apply(handler, args);
    });

    let encoded = false;
    if (result) {
      ctx.body = result;
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
        return this.defaultInvokeHandler.apply(this, args);
      }
      return handler.apply(handler, args);
    });
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}
}

function isHttpEvent(event): event is SCF.APIGatewayEvent {
  return event?.httpMethod && event?.headers && event?.requestContext;
}
