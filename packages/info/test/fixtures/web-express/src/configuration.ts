import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as express from '@midwayjs/express';

@Configuration({
  imports: [
    express,
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config.default'),
  ]
})
export class AutoConfiguration {

}
