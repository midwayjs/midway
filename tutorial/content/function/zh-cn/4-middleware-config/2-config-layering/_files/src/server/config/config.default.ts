import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    keys: ['123456'],
    port: 7001,
    globalPrefix: '/api',
  },
  app: {
    name: 'midway-functional-tutorial',
    version: '1.0.0',
  },
} as MidwayConfig;
