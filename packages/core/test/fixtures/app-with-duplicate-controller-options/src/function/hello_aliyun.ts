import { Get, Controller } from '../../../../../src';

@Controller('/', { middleware: ['auth']})
export class HelloAliyunService {
  @Get('/aliyun_invoke')
  async invoke() {}
}
