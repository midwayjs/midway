import { Configuration, App, MidwayMockService, Inject } from '@midwayjs/core';
@Configuration({
  importConfigs: [
  ],
})
export class MainConfiguration {

  @App()
  app;

  @Inject()
  mockService: MidwayMockService;

  async onReady(container) {
    this.mockService.mockContext(this.app, 'originEvent', {
      text: 'a'
    });
  }
}
