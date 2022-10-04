import {
  Controller,
  Get,
  Provide,
  Inject,
} from '@midwayjs/core';
import { IMidwayKoaContext } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Get('/abc/*')
  async home() {
    return 'hello worldabc';
  }

  @Get('/*')
  async home_abc() {
    return 'hello world';
  }

}
