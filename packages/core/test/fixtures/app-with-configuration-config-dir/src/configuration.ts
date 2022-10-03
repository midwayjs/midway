import { Configuration } from '../../../../src';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config.default'),
    join(__dirname,'./config/')
  ],
})
class AutoConfiguraion {}

module.exports = AutoConfiguraion;
