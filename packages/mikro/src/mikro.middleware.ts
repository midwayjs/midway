import { Context, IMiddleware, Middleware, NextFunction } from '@midwayjs/core';
import { RequestContext } from '@mikro-orm/core';
import { MikroDataSourceManager } from './dataSourceManager';

@Middleware()
export class MikroMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 控制器前执行的逻辑
      const em = await ctx.requestContext.getAsync(MikroDataSourceManager);

      const result = await RequestContext.create(
        [...em.getAllDataSources().values()].map(e => e.em),
        next
      );
      // 返回给上一个中间件的结果
      return result;
    };
  }
}
