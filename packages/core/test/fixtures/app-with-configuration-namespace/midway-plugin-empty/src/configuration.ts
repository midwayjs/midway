import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config/config.default',
    './config/config.local'
  ],
  namespace: 'empty'
})
export class AutoConfiguraione {}
