import { Trace, TraceService } from '../../../../src';
import { Inject, Provide, sleep } from '@midwayjs/core';

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
