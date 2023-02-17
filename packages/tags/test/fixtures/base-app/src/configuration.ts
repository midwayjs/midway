import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config.default'),
  ]
})
export class AutoConfiguration {

}
