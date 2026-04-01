import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import { DefaultErrorFilter } from './filter/default.filter';

@Configuration({
  imports: [koa],
  importConfigs: [
    {
      default: DefaultConfig,
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
