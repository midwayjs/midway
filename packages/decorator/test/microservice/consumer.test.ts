import {
  Consumer,
  getClassMetadata,
  getObjectDefinition,
  listModule,
  MS_CONSUMER_KEY,
  MSListenerType,
  ScopeEnum,
} from '../../src';

@Consumer(MSListenerType.RABBITMQ)
class TestFun {}

@Consumer(MSListenerType.MQTT)
class TestFun1 {}

describe('/test/microservice/consumer.test.ts', () => {
  it('test consumer decorator', () => {
    const meta = getClassMetadata(MS_CONSUMER_KEY, TestFun);
    expect(meta).toEqual({"metadata": {}, "type": "rabbitmq"})

    const meta2 = getClassMetadata(MS_CONSUMER_KEY, TestFun1);
    expect(meta2).toEqual({"metadata": {}, "type": "mqtt"})

    const def = getObjectDefinition(TestFun);
    expect(def).toEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(MS_CONSUMER_KEY);
    expect(m.length).toEqual(2);
  });
});
