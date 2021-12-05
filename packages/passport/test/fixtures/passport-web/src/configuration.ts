import { Configuration } from '@midwayjs/decorator';
import * as passport from '../../../../src';
import * as path from 'path';

@Configuration({
  imports: [passport],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {
}
