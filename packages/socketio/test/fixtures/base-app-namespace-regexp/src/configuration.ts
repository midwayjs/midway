import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        socketIO: {
          port: 3000
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
