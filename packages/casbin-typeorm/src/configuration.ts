import { Configuration, IMidwayContainer, Inject } from '@midwayjs/core';
import * as typeorm from '@midwayjs/typeorm';
import * as casbin from '@midwayjs/casbin';
import { TypeORMAdapter } from './adapter';

@Configuration({
  namespace: 'casbin-typeorm',
  imports: [typeorm, casbin],
  importConfigs: [
    {
      default: {
        casbinTypeORM: {
          dataSourceName: 'node-casbin-official',
        },
      },
    },
  ],
})
export class CasbinTypeORMConfiguration {
  @Inject()
  casbinAdapterManager: casbin.CasbinAdapterManager;

  async onReady(container: IMidwayContainer) {
    const adapter = await container.getAsync(TypeORMAdapter);
    this.casbinAdapterManager.setAdapter(adapter);
  }
}
