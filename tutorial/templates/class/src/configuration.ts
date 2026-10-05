import { Configuration, App, CommonJSFileDetector } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as UnittestConfig from './config/config.unittest';

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
}
