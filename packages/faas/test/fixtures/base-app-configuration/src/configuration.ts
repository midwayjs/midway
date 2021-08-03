import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [],
  importConfigs: ['./config.default', './config/config.prod'],
})
export class AutoConfiguration {}
