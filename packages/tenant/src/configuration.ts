import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { TenantManager } from './tenantManager';

@Configuration({
  namespace: 'tenant',
  importConfigs: [
    {
      default: {
        asyncContextManager: {
          enable: true,
        },
      },
    },
  ],
})
export class TenantConfiguration {
  async onReady(container: IMidwayContainer) {
    await container.getAsync(TenantManager);
  }
}
