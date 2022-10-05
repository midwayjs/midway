import {
  WSEmit,
  OnWSMessage,
  Provide,
  WSController,
} from '@midwayjs/core';

@Provide()
@WSController()
export class APIController {
  @OnWSMessage('my')
  @WSEmit('returnValue')
  async gotMyMessage(payload) {
    return { name: 'harry' };
  }
}
