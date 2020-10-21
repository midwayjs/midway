import { Provide } from '@midwayjs/decorator';
import { IMidwayWebContext } from '../../../../../../src';

@Provide()
export class GlobalMiddleware1 {
  resolve() {
    return async (ctx: IMidwayWebContext, next) => {
      console.log('1///');
      ctx.state.a = '1111';
      await next();
    }
  }
}

@Provide()
export class GlobalMiddleware2 {
  resolve() {
    return async (ctx: IMidwayWebContext, next) => {
      ctx.state.b = '2222';
      await next();
    }
  }
}

@Provide()
export class GlobalMiddleware3 {
  resolve() {
    return async (ctx: IMidwayWebContext, next) => {
      ctx.state.c = '3333';
      await next();
    }
  }
}

@Provide()
export class GlobalMiddleware4 {
  resolve() {
    return async (ctx: IMidwayWebContext, next) => {
      ctx.state.d = '4444';
      await next();
    }
  }
}
