import { Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import { Framework } from '../../../../src';
import * as Validate from '../../../../../validate';
import { TestMiddleware } from './middleware/test';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    Validate
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @App()
  app;

  @Inject()
  framework: Framework;

  async onReady() {
    this.framework.useMiddleware(async (ctx, next) => {
      await next();
    });

    this.framework.useMiddleware(TestMiddleware);
  }
}
