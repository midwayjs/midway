import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { KafkaProducerFactory } from './service';

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
  async onReady(container: IMidwayContainer) {
    await container.getAsync(KafkaProducerFactory);
  }
}
