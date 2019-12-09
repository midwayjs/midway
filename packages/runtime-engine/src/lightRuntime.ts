/* istanbul ignore file */
import { ServerlessBaseRuntime } from './runtime';
import { LightRuntime } from './interface';

/**
 * A lightweight runtime implementation for a platform like aliyun fc that does not provide a custom runtime
 * So you can wrapper invoke handler use asyncEvent method
 */
export abstract class ServerlessLightRuntime extends ServerlessBaseRuntime
  implements LightRuntime {

  async invokeHandlerWrapper(context, invokeHandler) {
    // load context extension
    for (const contextExtension of this.getContextExtensions() || []) {
      await contextExtension(context, this);
    }
    try {
      await this.handlerInvokerWrapper('beforeInvokeHandler', [context]);
      const result = await invokeHandler();
      await this.handlerInvokerWrapper('afterInvokeHandler', [
        null,
        result,
        context,
      ]);
      return result;
    } catch (err) {
      await this.handlerInvokerWrapper('afterInvokeHandler', [
        err,
        null,
        context,
      ]);
      throw err;
    }
  }

  abstract asyncEvent(handler): (...args) => void;
}
