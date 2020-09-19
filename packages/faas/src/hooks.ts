import { FaaSContext, IFaaSApplication } from './interface';
import * as compose from 'koa-compose';
import { Middleware, loadMiddleware } from './middleware';

export class MidwayHooks {
  private readonly ctx: FaaSContext;
  private readonly app: IFaaSApplication;

  constructor(ctx: FaaSContext, app: IFaaSApplication) {
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
    return this.ctx.requestContext.configService.getConfiguration(key);
  }

  useLogger() {
    return this.ctx.logger;
  }

  usePlugin(key: string) {
    return this.ctx[key] || this.app[key];
  }

  async useMiddleware(middlewares: Middleware<FaaSContext>[]) {
    const mw = await loadMiddleware(this.ctx.requestContext, middlewares);
    await compose(mw)(this.ctx);
  }
}
