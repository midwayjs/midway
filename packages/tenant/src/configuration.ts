import {
  Configuration,
  IMidwayContainer,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
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
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady(container: IMidwayContainer) {
    await container.getAsync(TenantManager);
  }
}
