import { Configuration, App } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  imports: [
    require('../../../../src'),
  ],
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @MainApp()
  app;

  async onReady() {
  }
}
