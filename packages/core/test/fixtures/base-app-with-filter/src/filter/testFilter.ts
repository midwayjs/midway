import { Provide } from '@midwayjs/decorator';

@Provide()
export class TestFilter {

  doFilter() {
    return async (ctx, next) => {

    }
  }

}

@Provide()
export class TestFilter2 {

  doFilter() {
    return async (ctx, next) => {

    }
  }

}
