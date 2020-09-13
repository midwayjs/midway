import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: ['./config.default', './config/'],
})
class AutoConfiguraion {}

module.exports = AutoConfiguraion;
