import { Provide, Controller, Get } from '@midwayjs/decorator';

@Provide()
@Controller('/user')
export class ControllerTestService {
  @Get('/')
  async handler() {
    return 'user'
  }
}
