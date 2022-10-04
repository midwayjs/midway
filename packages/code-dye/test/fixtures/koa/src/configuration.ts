import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ['test'],
        codeDye: {
          output: 'json'
        }
      }
    }
  ]
})
export class AutoConfiguration {}
