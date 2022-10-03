import { Provide } from '../../../../../src';
import { IMiddleware, IMidwayContext } from '../../../../../src';

@Provide()
export class TestFilter implements IMiddleware<IMidwayContext, any> {

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
