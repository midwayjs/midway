import { Configuration, MainApp, MidwayMockService, Inject } from '@midwayjs/core';
@Configuration({
  importConfigs: [
  ],
})
export class MainConfiguration {

  @MainApp()
  app;

  @Inject()
  mockService: MidwayMockService;

  async onReady(container) {
    this.mockService.mockContext(this.app, 'originEvent', {
      text: 'a'
    });
  }
}
