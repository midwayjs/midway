import {
  Controller,
  Get,
  Provide,
  Inject,
} from '@midwayjs/core';
import { Context, IMidwayExpressRequest } from '../../../../../src';
import { TestMiddleware, TestControllerMiddleware } from '../test.middleware';

@Provide()
@Controller('/', { middleware: [TestControllerMiddleware]})
export class APIController {

  @Inject()
  ctx: Context;

  @Inject()
  req: IMidwayExpressRequest;

  @Get('/', { middleware: []})
  async home() {
    return this.req.user + 'hello world';
  }

  @Get('/11', { middleware: [TestMiddleware]})
  async home1() {
    return this.req.user + 'hello world11';
  }
}
