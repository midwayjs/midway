import { Provide } from '@midwayjs/decorator';

@Provide('testMiddleware')
export class TestMiddleware {
  resolve() {
    return (req, res, next) => {
      req.user = 'harry';
      next();
    }
  }
}
