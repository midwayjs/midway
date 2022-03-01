import { Configuration, Inject } from '@midwayjs/decorator';
import { MidwayRabbitMQFramework } from './framework';

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
  @Inject()
  framework: MidwayRabbitMQFramework;

  async onReady() {}
}
