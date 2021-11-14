import { Provide } from '@midwayjs/decorator';
import { IMiddleware, IMidwayContext } from '../../../../../src';

@Provide()
export class TestFilter implements IMiddleware<IMidwayContext> {

  resolve() {
    return async (ctx, next) => {

    }
  }
}

@Provide()
export class TestFilter2 {

  resolve() {
    return async (ctx, next) => {

    }
  }

  getName() {

  }

}
