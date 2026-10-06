import { CommonJSFileDetector } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import * as UnittestConfig from './config/config.unittest';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  detector: new CommonJSFileDetector(),
});
