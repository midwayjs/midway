import { Provide, Func, Inject } from '@midwayjs/decorator';
@Provide()
export class EventService {
  @Inject()
  ctx;

  @Func('event.handler')
  handler(event?: any) {
    return event;
  }
}
