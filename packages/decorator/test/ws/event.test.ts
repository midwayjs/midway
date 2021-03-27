import {
  WSEmit,
  getClassMetadata,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  WS_EVENT_KEY,
  WSController,
  WSEventTypeEnum
} from '../../src';

@WSController('bbb')
class TestFun {
  @OnWSConnection()
  init() {
  }

  @OnWSMessage('my')
  @WSEmit('ok')
  async gotMyMessage(payload) {
    return { name: 'harry' };
  }

  @OnWSDisConnection()
  disconnect(reason: string) {
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
  });
});
