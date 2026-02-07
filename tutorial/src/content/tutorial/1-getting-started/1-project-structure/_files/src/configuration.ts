import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa],
})
export class MainConfiguration {
  @App()
  app: koa.Application;
}
