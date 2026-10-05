import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    keys: ['123456'],
    port: 7001,
  },
  app: {
    name: 'midway-tutorial',
    version: '1.0.0',
  },
  logger: {
    enabled: true,
  },
} as MidwayConfig;
