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
        midwayLogger: {
          clients: {
            wsLogger: {
              fileLogName: 'midway-ws.log'
            }
          }
        }
      },
    },
  ],
})
export class WebSocketConfiguration {}
