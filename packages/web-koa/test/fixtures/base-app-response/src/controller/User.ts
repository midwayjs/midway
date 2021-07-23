import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/api/user')
export class UserController {

  @Get('/info', { middleware: ['resMiddleware']})
  async api() {
    return undefined;
  }
}
