import { Get, Controller } from '../../../../../src';

@Controller()
export class HelloAliyunService {
  @Get('/aliyun_invoke')
  async invoke() {}
}
