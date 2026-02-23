import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
});
