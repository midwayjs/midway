import { Trace, TraceService } from '../../../../src';
import { Inject, Provide, sleep } from '@midwayjs/decorator';

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
