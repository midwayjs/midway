import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config.default',
    './config.local'
  ],
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src',
    '../../midway-plugin-empty/src',
    'midway-plugin-mod',
    '@midwayjs/midway-plugin-atmod',
    '@midwayjs/midway-plugin-btmod',
    '@midwayjs/midway-plugin-btmod'
  ],
})
export class AutoConfiguraion {}
