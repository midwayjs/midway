import { Provide } from '@midwayjs/core';

@Provide()
export class TestMiddleware {
  resolve() {
    return (req, res, next) => {
      req.user = 'harry';
      next();
    }
  }
}

@Provide()
export class TestControllerMiddleware {
  resolve() {
    return (req, res, next) => {
      req.user = '111';
      next();
    }
  }
}
