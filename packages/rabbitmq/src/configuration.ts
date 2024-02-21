import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'rabbitMQ',
  importConfigs: [
    {
      default: {
        rabbitmq: {},
      },
    },
  ],
})
export class RabbitMQConfiguration {
  async onReady() {}
}
