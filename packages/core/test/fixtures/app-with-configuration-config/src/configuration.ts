import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config.default'),
    join(__dirname, './config/config.local'),
    join(__dirname, './config/config.daily'),
    join(__dirname, './config/config.pre'),
    join(__dirname, './config/config.prod'),
    join(__dirname, '../custom.default'),
  ],
})
class AutoConfiguration {
}

module.exports = AutoConfiguration;
