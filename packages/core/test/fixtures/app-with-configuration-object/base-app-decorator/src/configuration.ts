import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config.default'),
    join(__dirname, './config.local')
  ],
  imports: [
    require('../../midway-plugin-mock'),
  ],
})
export class AutoConfiguration {}
