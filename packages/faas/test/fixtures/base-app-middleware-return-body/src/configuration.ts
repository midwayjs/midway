import {
  Configuration,
  MainApp,
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

  @MainApp()
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
