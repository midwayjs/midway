import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core';
import { Context } from '../../../../../src';
import { httpError } from '@midwayjs/core';

@Controller('/')
export class APIController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    throw new httpError.BadRequestError('my error');
  }
}
