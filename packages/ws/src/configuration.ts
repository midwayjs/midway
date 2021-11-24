import { Configuration } from '@midwayjs/decorator';

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
