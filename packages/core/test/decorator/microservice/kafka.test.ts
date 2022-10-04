import {
  Consumer,
  getClassMetadata,
  getPropertyDataFromClass,
  MS_CONSUMER_KEY,
  MSListenerType,
  KafkaListener,
} from '../../../src';

@Consumer(MSListenerType.KAFKA)
class TestFun {

  @KafkaListener('tasks')
  async gotEvent() {
  }
}

describe('/test/microservice/kafka.test.ts', () => {
  it('test kafka listener decorator', () => {
    const meta = getClassMetadata(MS_CONSUMER_KEY, TestFun);
    expect(meta).toEqual({"metadata": {}, "type": "kafka"});

    const data = getPropertyDataFromClass(MS_CONSUMER_KEY, TestFun, 'gotEvent');
    expect(data[0]).toEqual({ 'propertyKey': 'gotEvent', 'topic': 'tasks' });
  });
});
