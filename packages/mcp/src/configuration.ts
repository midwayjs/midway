import { Configuration, Inject, MidwayApplicationManager, MidwayConfigService } from '@midwayjs/core';
import { MidwayMCPFramework } from './framework';

@Configuration({
  namespace: 'mcp',
  importConfigs: [
    {
      default: {
        mcp: {},
      },
    },
  ],
})
export class MCPConfiguration {
  @Inject()
  framework: MidwayMCPFramework

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager.getApplications(['egg', 'express', 'koa']).forEach(app => {
      this.framework.initializeMCPTransport(app);
    });
  }
}
