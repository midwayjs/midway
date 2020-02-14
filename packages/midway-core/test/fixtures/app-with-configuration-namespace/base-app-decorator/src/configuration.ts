import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src',
    '../node_modules/midway-plugin-mod'
  ],
})
export class AutoConfiguraion {}
