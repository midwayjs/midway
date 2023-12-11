import { Configuration } from '@midwayjs/core';
import * as cacheComponent from '../../../../src';

@Configuration({
  imports: [
    cacheComponent
  ],
  importConfigs: [
    {
      default: {
        cacheManager: {
          clients: {
            default: {
              store: 'memory',
              options: {
                max: 100,
                ttl: 10,
              },
            },
          },
        }
      }
    }
  ]
})
export class ContainerLifeCycle {
}
