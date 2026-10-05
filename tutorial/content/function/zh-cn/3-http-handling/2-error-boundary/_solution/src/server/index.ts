import { CommonJSFileDetector } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as UnittestConfig from './config/config.unittest';
import { DefaultErrorFilter } from './filter/default.filter';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
  detector: new CommonJSFileDetector(),
  async onReady(_container, app) {
    app.useFilter([DefaultErrorFilter]);
  },
});
