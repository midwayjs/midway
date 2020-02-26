import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config.default',
    './config.local'
  ],
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src',
    'midway-plugin-mod',
    '@midwayjs/midway-plugin-atmod'
  ],
})
export class AutoConfiguraion {}
