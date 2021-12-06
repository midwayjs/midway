import {
  ILifeCycle,
  IMidwayContainer,
  IMidwayApplication
} from '@midwayjs/core';
import {
  App,
  Configuration,
} from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    {
      swagger: {
        title: 'My Project',
        description: 'This is a swagger-ui for midwayjs project',
        version: '1.0.0',
        swaggerPath: '/swagger-ui'
      },
    }
  ],
  namespace: 'swagger',
})
export class SwaggerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  async onReady(container: IMidwayContainer) {

  }
}