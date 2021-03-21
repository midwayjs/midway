import { Controller, Provide, Get } from '@midwayjs/decorator';

@Provide()
@Controller()
export class HomeController {
  @Get()
  async homeAPI() {
    return 'hello world';
  }
}
