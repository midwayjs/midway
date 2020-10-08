import {
  Consumer,
  getClassMetadata,
  getPropertyDataFromClass,
  MS_CONSUMER_KEY,
  MSListenerType,
  RabbitMQListener,
} from '../../src';

@Consumer(MSListenerType.RABBITMQ)
class TestFun {

  @RabbitMQListener('tasks')
  async gotEvent() {
  }
}

describe('/test/microservice/rabbit.test.ts', () => {
  it('test rabbit listner decorator', () => {
    const meta = getClassMetadata(MS_CONSUMER_KEY, TestFun);
    expect(meta).toEqual('rabbitmq');

    const data = getPropertyDataFromClass(MS_CONSUMER_KEY, TestFun, 'gotEvent');
    expect(data[0]).toEqual({ 'propertyKey': 'gotEvent', 'queueName': 'tasks' });
  });
});
