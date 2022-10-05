import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  imports: [
  ],
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class AutoConfiguration {
}
