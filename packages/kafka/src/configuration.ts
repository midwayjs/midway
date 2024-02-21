import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'kafka',
  importConfigs: [
    {
      default: {
        kafka: {},
      },
    },
  ],
})
export class KafkaConfiguration {
  async onReady() {}
}
