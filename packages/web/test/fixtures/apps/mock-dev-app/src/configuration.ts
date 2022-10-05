import { join } from 'path';
import { Configuration } from '@midwayjs/core';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class AutoConfiguration {

}
