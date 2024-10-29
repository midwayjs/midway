import { Configuration, IMidwayContainer, Inject } from '@midwayjs/core';
// import { KafkaProducerFactory } from './service';
import { MidwayKafkaFramework } from './framework';

@Configuration({
  namespace: 'kafka',
  importConfigs: [
    {
      default: {
        kafka: {
          contextLoggerApplyLogger: 'kafkaLogger',
        },
        midwayLogger: {
          clients: {
            kafkaLogger: {
              fileLogName: 'midway-kafka.log',
            },
          },
        },
      },
    },
  ],
})
export class KafkaConfiguration {
  @Inject()
  framework: MidwayKafkaFramework;
  // factory: KafkaProducerFactory;
  async onReady(container: IMidwayContainer) {
    // this.factory = await container.getAsync(KafkaProducerFactory);
  }

  async onStop() {
    // await this.factory.stop();
  }
}
