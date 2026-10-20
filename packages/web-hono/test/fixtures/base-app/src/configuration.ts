import { Configuration, Inject } from '@midwayjs/core';
import * as hono from '../../../../src';
import { MidwayHonoFramework } from '../../../../src/framework';

@Configuration({
  imports: [hono],
})
export class AutoConfiguration {
  @Inject()
  honoFramework: MidwayHonoFramework;

  async onReady() {
    // add a middleware to validate middleware chain for Hono scene.
    this.honoFramework.getApplication().use('/api/*', async (ctx, next) => {
      ctx.header('x-from-middleware', 'true');
      await next();
    });
  }
}
