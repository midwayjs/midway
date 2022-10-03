import { Configuration } from '../../../../../src';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, 'config.default')
  ],
  namespace: 'mod3'
})
export class Mod3Configuration {}
