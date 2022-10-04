import { App, Configuration, Middleware } from '@midwayjs/core';
import { join } from 'path';

@Middleware()
export class CustomMiddleware {
  resolve() {
    return async (ctx, next) => {
      ctx.setAttr('abc', 'bcd');
      await next();
    }
  }
}

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
})
export class AutoConfiguration {

  @App()
  app;
  async onReady() {
    this.app.useMiddleware(CustomMiddleware);
  }
}
