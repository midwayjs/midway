import { ESModuleFileDetector } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: {
        keys: 'midway-react-functional-api-sample-key',
        koa: {
          globalPrefix: '/api',
          port: 7001,
        },
      },
      local: {
        koa: {
          port: null,
        }
      }
    },
  ],
  detector: new ESModuleFileDetector({
    ignore: ['**/api/index.*'],
  }),
});
