import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'commander',
  importConfigs: [
    {
      default: {},
    },
  ],
})
export class CommanderConfiguration {}
