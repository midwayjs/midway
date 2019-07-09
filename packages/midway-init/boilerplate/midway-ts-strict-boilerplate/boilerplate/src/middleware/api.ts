import { WebMiddleware, Middleware, provide } from 'midway'


@provide()
export class ApiMiddleware implements WebMiddleware {

  public resolve(): Middleware {
    return async (ctx, next) => {
      ctx.api = {
        reqTimeStr: new Date().toLocaleString(),
      }
      await next()
    }
  }

}
