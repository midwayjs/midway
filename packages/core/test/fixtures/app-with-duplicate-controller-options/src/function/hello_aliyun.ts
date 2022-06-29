import { Get, Controller } from '@midwayjs/decorator';

@Controller()
export class HelloAliyunService {
  @Get('/aliyun_invoke')
  async invoke() {}
}
