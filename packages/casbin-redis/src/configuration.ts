import { Configuration, IMidwayContainer, Inject } from '@midwayjs/core';
import * as redis from '@midwayjs/redis';
import * as casbin from '@midwayjs/casbin';
import { NodeRedisAdapter } from './adapter';

@Configuration({
  namespace: 'casbin-redis',
  imports: [redis, casbin],
  importConfigs: [
    {
      default: {
        casbinRedis: {
          clientName: 'node-casbin-official',
        },
      },
    },
  ],
})
export class CasbinRedisConfiguration {
  @Inject()
  casbinAdapterManager: casbin.CasbinAdapterManager;

  async onReady(container: IMidwayContainer) {
    const adapter = await container.getAsync(NodeRedisAdapter);
    this.casbinAdapterManager.setAdapter(adapter);
  }
}
