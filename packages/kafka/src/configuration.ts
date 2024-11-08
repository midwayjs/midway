import { Configuration } from '@midwayjs/core';

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
export class KafkaConfiguration {}
