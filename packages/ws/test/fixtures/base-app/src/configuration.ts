import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        webSocket: {
          port: 3000,
          enableServerHeartbeatCheck: true,
          serverHeartbeatInterval: 1000,
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
  }
}
