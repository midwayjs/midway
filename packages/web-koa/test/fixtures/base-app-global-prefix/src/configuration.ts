import { Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import { Framework } from '../../../../src';
import * as Koa from '../../../../src';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    Koa
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @App()
  app;

  @Inject()
  framework: Framework;

  async onReady() {
  }
}
