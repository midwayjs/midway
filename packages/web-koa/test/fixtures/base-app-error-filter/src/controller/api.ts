import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core';
import { Context } from '../../../../../src';

@Controller('/')
export class APIController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    throw new Error('my error');
  }
}
