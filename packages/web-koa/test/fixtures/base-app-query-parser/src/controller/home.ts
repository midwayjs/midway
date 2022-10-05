import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core';
import { IMidwayKoaContext } from '../../../../../src';

@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Get('/query_array')
  async home() {
    return this.ctx.query;
  }

  @Get('/query_array_duplicate')
  async home_abc() {
    return this.ctx.query;
  }

}
