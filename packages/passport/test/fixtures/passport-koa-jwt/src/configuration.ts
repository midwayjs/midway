import { Configuration } from '@midwayjs/decorator';
import * as passport from '../../../../../passport/src';
import * as jwt from '../../../../../jwt/src';
import * as path from 'path';

@Configuration({
  imports: [passport, jwt],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, './config')],
})
export class ContainerLifeCycle {
}
