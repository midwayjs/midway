import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src',
    'midway-plugin-mod'
  ],
})
export class AutoConfiguraion {}
