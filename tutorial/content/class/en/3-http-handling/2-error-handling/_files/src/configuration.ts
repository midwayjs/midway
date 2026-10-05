import { Configuration, App, CommonJSFileDetector } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as UnittestConfig from './config/config.unittest';
import { DefaultErrorFilter } from './filter/default.filter';

@Configuration({
  imports: [koa],
  detector: new CommonJSFileDetector(),
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    this.app.useFilter([DefaultErrorFilter]);
  }
}
