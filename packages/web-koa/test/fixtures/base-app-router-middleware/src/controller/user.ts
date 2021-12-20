import { Controller, Get, Provide } from '@midwayjs/decorator';
import { TestMiddleware1, TestMiddleware2 } from '../middleware/test';

@Provide()
@Controller('/', {middleware: [TestMiddleware1]})
export class UserController {

  @Get('/', {middleware: [TestMiddleware2]})
  async home(ctx) {
    return ctx.body;
  }
}
