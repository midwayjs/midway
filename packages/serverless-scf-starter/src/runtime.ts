import { ServerlessLightRuntime } from '@midwayjs/runtime-engine';
import { Context } from './context';
import { SCFContext, SCFHTTPEvent } from './interface';

export class SCFRuntime extends ServerlessLightRuntime {
  /**
   * for handler wrapper
   * @param handler
   */
  asyncEvent(handler) {
    return (event: object = {}, context = {} as SCFContext) => {
      if (isHttpEvent(event)) {
        return this.wrapperWebInvoker(handler, event, context);
      }
      return this.wrapperEventInvoker(handler, event, context);
    };
  }

  async wrapperWebInvoker(handler, event: SCFHTTPEvent, context: SCFContext) {
    const ctx = new Context(event, context);
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

    return {
      isBase64Encoded: encoded,
      statusCode: ctx.status,
      headers: ctx.res.headers,
      body: ctx.body,
    };
  }

  async wrapperEventInvoker(handler, event: any, context: SCFContext) {
    const ctx = new Context({}, context);
    const args = [ctx, event];
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

function isHttpEvent(event): event is SCFHTTPEvent {
  return event?.httpMethod && event?.headers && event?.requestContext;
}
