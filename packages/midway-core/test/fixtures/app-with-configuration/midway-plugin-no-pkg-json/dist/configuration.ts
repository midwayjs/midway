import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'midway-plugin-no-pkg-json',
  importConfigs: [
    './config/config.default',
    './config/config.local'
  ]
})
export class AutoConfiguraion {}
