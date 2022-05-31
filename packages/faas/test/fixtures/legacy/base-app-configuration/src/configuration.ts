import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  imports: [],
  importConfigs: [
    join(__dirname, './config.default'),
    join(__dirname, './config/config.prod')
  ],
})
export class AutoConfiguration {}
