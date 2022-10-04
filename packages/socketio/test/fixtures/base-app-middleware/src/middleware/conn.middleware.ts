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
      ctx.setAttr('result', ctx.getAttr('result') as number + 2);
      return await next();
    }
  }
}


@Middleware()
export class ControllerMiddleware {
  resolve() {
    return async (ctx: Context, next) => {
      ctx.setAttr('result', ctx.getAttr('result') as number + 3);
      return await next();
    }
  }
}

@Middleware()
export class NamespaceConnectionMiddleware {
  resolve() {
    return async (ctx: Context, next) => {
      ctx.setAttr('result', ctx.getAttr('result') as number + 4);
      return await next();
    }
  }
}

@Middleware()
export class NamespacePacketMiddleware {
  resolve() {
    return async (ctx: Context, next) => {
      ctx.setAttr('result', ctx.getAttr('result') as number + 5);
      return await next();
    }
  }
}

@Middleware()
export class NamespacePacketMiddleware2 {
  resolve() {
    return async (ctx: Context, next) => {
      ctx.setAttr('result', ctx.getAttr('result') as number + 6);
      return await next();
    }
  }
}

