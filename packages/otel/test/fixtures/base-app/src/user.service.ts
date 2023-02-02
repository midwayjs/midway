import { Trace, TraceService } from '../../../../src';
import { Controller, Get, Inject, Provide, sleep } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/')
  getTraceId() {
    return this.ctx.traceId;
  }
}

@Provide()
export class UserService {

  @Inject()
  traceService: TraceService;

  @Trace('user.get')
  async invoke() {
    await sleep();
    return {
      test: 1
    };
  }

  @Trace('user.get_error')
  async invokeError() {
    await sleep();
    throw new Error('custom error');
  }
}
