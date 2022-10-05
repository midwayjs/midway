import {
  Controller, Get,
} from '../../../../../src';

@Controller('/', { middleware: ['auth1']})
export class HelloTencentService {
  @Get('/tencent_invoke')
  async invoke() {}
}
