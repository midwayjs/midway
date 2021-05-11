import {
  Consumer,
  getClassMetadata,
  getPropertyDataFromClass,
  MS_CONSUMER_KEY,
  MSListenerType,
  RabbitMQListener,
  ConsumerQueuePattern,
  MS_CONSUMER_QUEUE_METADATA
} from '../../src';

@Consumer(MSListenerType.RABBITMQ)
class TestFun {

  @RabbitMQListener('tasks')
  async gotEvent() {
  }
}

@Consumer(MSListenerType.RABBITMQ, {
  exchange: 'abc'
})
class NewTestFun {

  @ConsumerQueuePattern('tasks')
  async gotEvent() {
  }
}

describe('/test/microservice/rabbit.test.ts', () => {
  it('test rabbit listener decorator', () => {
    const meta = getClassMetadata(MS_CONSUMER_KEY, TestFun);
    expect(meta).toEqual({"metadata": {}, "type": "rabbitmq"});

    const data = getPropertyDataFromClass(MS_CONSUMER_KEY, TestFun, 'gotEvent');
    expect(data[0]).toEqual({ 'propertyKey': 'gotEvent', 'queueName': 'tasks' });
  });

  it('should got method from decorator', function () {
    const meta = getClassMetadata(MS_CONSUMER_QUEUE_METADATA, NewTestFun);
    expect(meta).toMatchSnapshot();
  });
});
