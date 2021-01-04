import { FaaSContext, IMidwayFaaSApplication } from './interface';

/**
 * Stability: 1 - Experimental
 */
export class MidwayHooks {
  private readonly ctx: FaaSContext;
  private readonly app: IMidwayFaaSApplication;

  constructor(ctx: FaaSContext, app: IMidwayFaaSApplication) {
    this.ctx = ctx;
    this.app = app;
  }

  useContext() {
    return this.ctx;
  }

  useInject<T>(identifier: any): Promise<T> {
    return this.ctx.requestContext.getAsync(identifier);
  }

  useConfig(key?: string) {
    return this.ctx.requestContext.getConfigService().getConfiguration(key);
  }

  useLogger() {
    return this.ctx.logger;
  }

  usePlugin(key: string) {
    return this.ctx[key] || this.app[key];
  }

  useApp() {
    return this.app;
  }
}
