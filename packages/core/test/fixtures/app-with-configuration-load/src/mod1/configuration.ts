import { Configuration } from '@midwayjs/decorator';
import { join } from "path";

@Configuration({
  importConfigs: [
    join(__dirname, 'config.default')
  ]
})
export class AutoConfiguration {}
