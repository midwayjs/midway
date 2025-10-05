import { Configuration, ILifeCycle, Inject, MidwayApplicationManager, MidwayConfigService } from '@midwayjs/core';
import { MidwayMCPFramework } from './framework';

@Configuration({
  namespace: 'mcp',
  importConfigs: [
    {
      default: {
        mcp: {
          endpoints: {
            streamHttp: '/mcp',
            sse: '/sse',
            messages: '/messages'
          }
        },
      },
    },
  ],
})
export class MCPConfiguration implements ILifeCycle {
  @Inject()
  framework: MidwayMCPFramework

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    const configurationOptions = this.configService.getConfiguration('mcp');
    const { transportType = 'stdio' } = configurationOptions;
    const actualTransportType = transportType === 'sse' ? 'stream-http' : transportType;

    if (actualTransportType === 'stream-http') {
      this.applicationManager.getApplications(['egg', 'express', 'koa']).forEach(app => {
        this.framework.initializeMCPTransport(app);
      });
    }
  }
}
