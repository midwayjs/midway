import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'ok',
  importConfigs: [
    './config/config.default',
    './config/config.local'
  ],
  imports: [
    '../../midway-plugin-mock/src'
  ]
})
export class AutoConfiguraion {}
