import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-ok/src'
  ],
  importConfigs: [
    './config.default',
    './config.local'
  ],
})
export class AutoConfiguraion {}
