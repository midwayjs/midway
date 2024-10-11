import { Configuration, App } from '@midwayjs/core';
@Configuration({
  importConfigs: [
  ],
})
export class MainConfiguration {

  @MainApp()
  app;

  async onReady(container) {
  }
}
