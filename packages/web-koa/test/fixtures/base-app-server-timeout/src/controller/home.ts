import {
  Controller,
  Get,
  Provide,
  Inject,
  sleep,
} from '@midwayjs/core';
import { IMidwayKoaContext } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Get('/')
  async home() {
    return 'hello world';
  }

  @Get('/timeout')
  async timeout() {
    await sleep(1200);
    return 'hello world';
  }
}
