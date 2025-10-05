import { Configuration, Inject, MidwayConfigService } from '@midwayjs/core';
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

  async onReady() {
  }
}
