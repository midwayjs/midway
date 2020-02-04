import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src'
  ],
})
export class AutoConfiguraion {}
