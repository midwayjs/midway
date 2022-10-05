import {
  Controller, Get,
} from '../../../../../src';

@Controller()
export class HelloTencentService {
  @Get('/tencent_invoke')
  async invoke() {}
}
