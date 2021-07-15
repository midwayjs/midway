import { Provide } from '@midwayjs/decorator';

@Provide()
export class ResMiddleware {
  resolve() {
    return async (ctx, next) => {
      console.log(ctx.body); //如果controller 返回null或者undefined的时候 下面虽然设置了ctx.body当时在在请求中不会有返回
      await next();
      ctx.body = 'middleware data';
    };
  }
}
