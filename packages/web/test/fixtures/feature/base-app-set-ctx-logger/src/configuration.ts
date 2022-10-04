import { Configuration, App } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
  @App()
  app: any;

  async onReady() {
    this.app.createAnonymousContext().logger.warn('configuration aaaaa');
    this.app.createAnonymousContext().logger.warn('configuration ccccc');
  }
}
