import { Configuration, App } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @App()
  app;

  async onReady() {
  }
}
