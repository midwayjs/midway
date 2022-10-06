import { Configuration, App, Guard, IGuard } from '@midwayjs/core';
import { join } from 'path';
import { IMidwayExpressApplication, Context } from '../../../../src';

@Guard()
export class MainGuard implements IGuard<Context> {
  async canActivate(ctx: Context): Promise<boolean> {
    return ctx.originalUrl !== '/api';
  }
}

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayExpressApplication;

  async onReady() {
    this.app.useGuard(MainGuard);
  }
}
