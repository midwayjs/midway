import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config.default'),
    join(__dirname, './config.local')
  ],
  imports: [
    require('../../midway-plugin-mock'),
    require('../../midway-plugin-ok'),
    require('../../midway-plugin-empty'),
    require('../../midway-plugin-emptytwo'),
  ],
})
export class AutoConfiguration {
}
