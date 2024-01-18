import { MidwayConfig } from '@midwayjs/core';
import mikroconfig from '../mikro-orm.config'
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1704679181212_3958',
  koa: {
    port: 7001,
  },
  mikro: {
    dataSource: {
      default: mikroconfig
    }
  },
} as MidwayConfig;
