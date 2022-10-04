import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'webSocket',
  importConfigs: [
    {
      default: {
        webSocket: {},
      },
    },
  ],
})
export class WebSocketConfiguration {}
