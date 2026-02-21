import { ESModuleFileDetector } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: {
        keys: 'midway-functional-api-service-sample-key',
        koa: {
          globalPrefix: '/api',
          port: 7001,
        },
      },
    },
  ],
  detector: new ESModuleFileDetector(),
});
