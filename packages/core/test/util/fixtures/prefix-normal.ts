import {  Controller, Get } from '@midwayjs/decorator';

@Controller('/')
export class IndexController {

  @Get('/', {ignoreGlobalPrefix: true})
  async index1() {
    return 'ok';
  }

  @Get('/222')
  async index2() {
    return 'ok';
  }
}
