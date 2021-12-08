import { Configuration, App } from '@midwayjs/decorator';
import * as passport from '../../../../src';
import * as path from 'path';
import * as egg from '@midwayjs/web';

@Configuration({
  imports: [egg, passport],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {

  @App()
  app;

  onReady() {
    this.app.useMiddleware('local');
  }
}
