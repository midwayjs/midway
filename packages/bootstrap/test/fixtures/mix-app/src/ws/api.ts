import {
  Emit,
  OnMessage,
  Provide,
  WSController,
} from '@midwayjs/decorator';

@Provide()
@WSController()
export class APIController {
  @OnMessage('my')
  @Emit('returnValue')
  async gotMyMessage(payload) {
    return { name: 'harry' };
  }
}
