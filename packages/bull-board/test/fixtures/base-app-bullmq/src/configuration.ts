import { Configuration } from '@midwayjs/core';
import * as bullBoard from '../../../../src';
import * as bullmq from '@midwayjs/bullmq';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa,
    bullmq,
    bullBoard,
  ],
  importConfigs: [
    {
      default: {
        keys: 123,
        bullmq: {
          defaultConnection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
    },
  ],
})
export class AutoConfiguration {

  async onReady(){
  }
}
