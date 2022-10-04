import { Configuration } from '@midwayjs/core';
import * as view from '../../../../src';
import { join } from 'path'
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa, view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(){
  }
}
