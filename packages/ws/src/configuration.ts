import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'webSocket',
  importConfigs: [
    {
      default: {
        webSocket: {
          enableServerHeartbeatCheck: false,
          serverHeartbeatInterval: 30000,
        },
      },
    },
  ],
})
export class WebSocketConfiguration {}
