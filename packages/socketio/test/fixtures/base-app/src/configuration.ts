import { Configuration, MainApp } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        socketIO: {
          port: 0
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
