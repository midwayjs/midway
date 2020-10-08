import {
  Consumer,
  getClassMetadata,
  getObjectDefProps,
  listModule,
  MS_CONSUMER_KEY,
  MSListenerType,
  ScopeEnum,
} from '../../src';

@Consumer(MSListenerType.RABBITMQ)
class TestFun {}

@Consumer(MSListenerType.MTTQ)
class TestFun1 {}

describe('/test/microservice/consumer.test.ts', () => {
  it('test consumer decorator', () => {
    const meta = getClassMetadata(MS_CONSUMER_KEY, TestFun);
    expect(meta).toEqual('rabbitmq')

    const meta2 = getClassMetadata(MS_CONSUMER_KEY, TestFun1);
    expect(meta2).toEqual('mttq')

    const def = getObjectDefProps(TestFun);
    expect(def).toEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(MS_CONSUMER_KEY);
    expect(m.length).toEqual(2);
  });
});
