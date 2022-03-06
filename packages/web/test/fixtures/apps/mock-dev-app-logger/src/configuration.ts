import { join } from 'path';
import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class AutoConfiguration {

}
