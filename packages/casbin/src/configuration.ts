import { Configuration } from '@midwayjs/core';
import { CasbinEnforcerService } from './enforcer.service';

@Configuration({
  namespace: 'casbin',
  importConfigs: [
    {
      default: {
        casbin: {},
      },
    },
  ],
})
export class CasbinConfiguration {
  async onReady(container) {
    await container.getAsync(CasbinEnforcerService);
  }
}
