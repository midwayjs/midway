import {  Controller, Get } from '../../../src';

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
