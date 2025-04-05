import { Configuration } from '@midwayjs/core';

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
  async onReady() {}
}
