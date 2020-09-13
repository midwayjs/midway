import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: '',
  importConfigs: [
    './config/config.default',
    './config/config.local'
  ]
})
export class AutoConfiguraionb {}
