import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    ctx.logger.error(err);
    return {
      success: false,
      message: err.message || 'Internal server error',
      code: err['code'] || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
  }
}
