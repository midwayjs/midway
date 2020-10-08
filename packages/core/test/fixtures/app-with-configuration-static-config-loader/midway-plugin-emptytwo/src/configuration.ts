import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  namespace: '',
  importConfigs: [
    join(__dirname, './config/config.default'),
    join(__dirname, './config/config.local'),
  ]
})
export class AutoConfiguration {}
