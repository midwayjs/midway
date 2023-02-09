import { Configuration, App } from '@midwayjs/core';
@Configuration({
  importConfigs: [
  ],
})
export class MainConfiguration {

  @App()
  app;

  async onReady(container) {
  }
}
