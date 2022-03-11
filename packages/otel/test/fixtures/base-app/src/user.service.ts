import { Trace, TraceService } from '../../../../src';
import { Inject, Provide, sleep } from '@midwayjs/decorator';

@Provide()
export class UserService {

  @Inject()
  traceService: TraceService;

  @Trace('user.get')
  async invoke() {
    await sleep();

    this.traceService.getTraceId()

    return {
      test: 1
    };
  }
}
