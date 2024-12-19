import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'kafka',
  importConfigs: [
    {
      default: {
        kafka: {},
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
export class KafkaConfiguration {}
