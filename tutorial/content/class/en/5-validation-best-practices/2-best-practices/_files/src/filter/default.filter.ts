import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    ctx.logger.error(err);

    return {
      success: false,
      message: err.message || '服务器内部错误',
      code: err['code'] || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
  }
}
