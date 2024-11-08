import { Configuration, MainApp } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKafkaApplication } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        kafka: {
          kafkaConfig: {
            clientId: 'my-app',
            brokers: [process.env.KAFKA_URL || 'localhost:9092'],
          },
          consumerConfig: {
            groupId: 'groupId-test-' + Math.random(),
          },
        },
      },
    },
  ],
})
export class AutoConfiguration implements ILifeCycle {
  @MainApp()
  app: IMidwayKafkaApplication;

  async onReady() {
    this.app.setAttr('total', 0);
  }
}
