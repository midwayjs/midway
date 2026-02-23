import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
});
