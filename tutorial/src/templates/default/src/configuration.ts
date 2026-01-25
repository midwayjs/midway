import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as defaultConfig from './config/config.default';
import { HomeController } from './controller/home.controller';

@Configuration({
  imports: [koa],
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {}
}
