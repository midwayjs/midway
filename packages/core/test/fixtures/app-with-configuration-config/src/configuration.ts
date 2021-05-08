import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    './config.default',
    './config/config.local',
    './config/config.daily',
    './config/config.pre',
    './config/config.prod',
    join(__dirname, '../custom.default')
  ],
})
class AutoConfiguration {}

module.exports = AutoConfiguration;
