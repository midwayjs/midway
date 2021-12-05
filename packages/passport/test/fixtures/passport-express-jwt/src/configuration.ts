import { App, Configuration } from '@midwayjs/decorator';
import * as passport from '../../../../../passport/src';
import * as jwt from '@midwayjs/jwt';
import * as path from 'path';
import { IMidwayExpressApplication } from '@midwayjs/express';

@Configuration({
  imports: [passport, jwt],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: IMidwayExpressApplication;
}
