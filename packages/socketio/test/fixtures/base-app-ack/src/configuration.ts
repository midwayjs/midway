import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwaySocketIOApplication } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        socketIO: {
          port: 3000,
          path: '/test'
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: IMidwaySocketIOApplication;

  async onReady() {
  }
}
