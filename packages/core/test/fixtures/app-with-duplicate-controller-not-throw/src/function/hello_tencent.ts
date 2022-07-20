import {
  Controller, Get,
} from '@midwayjs/decorator';

@Controller()
export class HelloTencentService {
  @Get('/tencent_invoke')
  async invoke() {}
}
