import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config.default',
    './config/config.local',
    './config/config.daily',
    './config/config.pre',
    './config/config.prod',
  ],
})
class AutoConfiguraion {}

module.exports = AutoConfiguraion;
