import { Configuration, MainApp, Inject } from '@midwayjs/core';
import { join } from 'path';
import { Framework } from '../../../../src';
import * as Express from '../../../../src';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    Express
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @MainApp()
  app;

  @Inject()
  framework: Framework;

  async onReady() {
  }
}
