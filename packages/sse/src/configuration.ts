import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'sse',
  importConfigs: [
    {
      default: {},
    },
  ],
})
export class ServerSentEventConfiguration {
}
