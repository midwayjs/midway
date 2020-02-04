import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'ok',
  importConfigs: [
    './config/config.default',
    './config/config.local'
  ]
})
export class AutoConfiguraion {}
