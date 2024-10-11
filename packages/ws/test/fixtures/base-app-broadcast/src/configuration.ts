import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        webSocket: {
          port: 3000
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @MainApp()
  app: Application;

  async onReady() {
  }
}
