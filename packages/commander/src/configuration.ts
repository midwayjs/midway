import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'commander',
  importConfigs: [
    {
      default: {
        midwayLogger: {
          clients: {
            commanderLogger: {
              fileLogName: 'midway-commander.log',
            },
          },
        },
      },
    },
  ],
})
export class CommanderConfiguration {}
