import { Configuration } from '@midwayjs/core';

/**
 * One-shot component configuration.
 */
@Configuration({
  namespace: 'oneShot',
  importConfigs: [
    {
      default: {
        midwayLogger: {
          clients: {
            oneShotLogger: {
              fileLogName: 'midway-one-shot.log',
            },
          },
        },
      },
    },
  ],
})
export class OneShotConfiguration {}
