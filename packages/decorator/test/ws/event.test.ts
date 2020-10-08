import {
  Broadcast,
  Emit,
  getClassMetadata,
  OnConnection,
  OnDisConnection,
  OnMessage, OnSocketError,
  WS_EVENT_KEY,
  WSController,
  WSEventTypeEnum
} from '../../src';

@WSController('bbb')
class TestFun {
  @OnConnection()
  init() {
  }

  @OnMessage('my')
  @Emit('ok')
  async gotMyMessage(payload) {
    return { name: 'harry' };
  }

  @OnDisConnection()
  disconnect(reason: string) {
  }

  @Broadcast()
  broadcast() {
    return 'ok';
  }

  @OnSocketError('err')
  error() {

  }
}

describe('/test/ws/event.test.ts', function () {
  it('test ws connect and event decorator', () => {
    const data = getClassMetadata(WS_EVENT_KEY, TestFun);
    expect(data[0].eventType).toEqual(WSEventTypeEnum.ON_CONNECTION);
    expect(data[0].propertyName).toEqual('init');

    expect(data[1].eventType).toEqual(WSEventTypeEnum.EMIT);
    expect(data[1].propertyName).toEqual('gotMyMessage');
    expect(data[1].messageEventName).toEqual('ok');

    expect(data[2].eventType).toEqual(WSEventTypeEnum.ON_MESSAGE);
    expect(data[2].propertyName).toEqual('gotMyMessage');
    expect(data[2].messageEventName).toEqual('my');

    expect(data[3].eventType).toEqual(WSEventTypeEnum.ON_DISCONNECTION);
    expect(data[3].propertyName).toEqual('disconnect');

    expect(data[4].eventType).toEqual(WSEventTypeEnum.BROADCAST);
    expect(data[4].propertyName).toEqual('broadcast');

    expect(data[5].eventType).toEqual(WSEventTypeEnum.ON_SOCKET_ERROR);
    expect(data[5].propertyName).toEqual('error');
    expect(data[5].messageEventName).toEqual('err');
  });
});
