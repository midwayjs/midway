import { Configuration, App } from '@midwayjs/core';
import * as passport from '../../../../src';
import * as path from 'path';
import * as egg from '@midwayjs/web';
import { AuthMiddleware } from './local.middleware';

@Configuration({
  imports: [egg, passport],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {

  @App()
  app;

  onReady() {
    this.app.useMiddleware(AuthMiddleware);
  }
}
