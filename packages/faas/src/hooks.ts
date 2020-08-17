import { FaaSContext } from './interface';

/**
 * Stability: 1 - Experimental
 */
export class MidwayHooks {
  private readonly ctx: FaaSContext;

  constructor(ctx: FaaSContext) {
    this.ctx = ctx;
  }

  useContext() {
    return this.ctx;
  }

  useInject<T>(identifier: any): Promise<T> {
    return this.ctx.requestContext.getAsync(identifier);
  }

  useConfig (key?: string) {
    return this.ctx.requestContext.configService.getConfiguration(key);
  }

  useLogger () {
    return this.ctx.logger;
  }
}
