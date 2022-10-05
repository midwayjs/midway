import { Middleware } from '@midwayjs/core';
import { Context } from '../../../../../src';

@Middleware()
export class ConnectionMiddleware {
  resolve() {
    return async (ctx: Context, next) => {
      ctx.setAttr('result', 1);
      return await next();
    }
  }
}

@Middleware()
export class PacketMiddleware {
  resolve() {
    return async (ctx: Context, next) => {
      try {
        await next();
        return 'ok';
      } catch (err) {
        throw new Error('packet error');
      }
    }
  }
}
