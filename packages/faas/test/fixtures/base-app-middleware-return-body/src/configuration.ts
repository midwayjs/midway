import {
  Configuration,
  App,
  Inject,
} from '@midwayjs/core';
import { Framework } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        keys: 'key',
      }
    }
  ],
  imports: [],
})
export class ContainerConfiguration {

  @App()
  app;

  @Inject()
  framework: Framework;

  async onReady() {
    this.framework.useMiddleware(async (ctx, next) => {
      const result = await next();
      if (!result) {
        return {
          code: 0,
          msg: 'ok',
          data: result,
        }
      }
    });
  }
}
