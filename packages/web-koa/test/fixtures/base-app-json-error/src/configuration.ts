import { Configuration, Controller, Get, Inject } from '@midwayjs/core';
import { join } from 'path';
import { Context } from '../../../../src';
import { httpError } from '@midwayjs/core';

@Controller('/')
export class APIController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.type = 'json';
    throw new httpError.BadRequestError('my error');
  }

  @Get('/bbb.json')
  async jsonSuffix() {
    throw new httpError.BadRequestError('my error');
  }

  @Get('/accept_json')
  async accept_json() {
    throw new httpError.BadRequestError('my error');
  }
}


@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {}
