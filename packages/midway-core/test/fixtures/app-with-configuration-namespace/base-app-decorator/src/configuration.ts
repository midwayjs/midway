import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src',
    'midway-plugin-mod',
    '@midwayjs/midway-plugin-atmod'
  ],
})
export class AutoConfiguraion {}
