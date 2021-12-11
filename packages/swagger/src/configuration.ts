import {
  ILifeCycle,
  IMidwayContainer,
  IMidwayApplication,
} from '@midwayjs/core';
import { App, Configuration } from '@midwayjs/decorator';
import { SwaggerExplorer, SwaggerMiddleware } from '.';

@Configuration({
  importConfigs: [
    {
      default: {
        swagger: {
          title: 'My Project',
          description: 'This is a swagger-ui for midwayjs project',
          version: '1.0.0',
          swaggerPath: '/swagger-ui',
        },
      },
    },
  ],
  namespace: 'swagger',
})
export class SwaggerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  async onReady(container: IMidwayContainer) {
    const ret = await container.getAsync(SwaggerMiddleware);

    this.app.useMiddleware(ret.resolve());

    const explorer = await container.getAsync(SwaggerExplorer);
    explorer.scanApp();
  }
}
