import { Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config.default'),
  ]
})
export class AutoConfiguration {

}
