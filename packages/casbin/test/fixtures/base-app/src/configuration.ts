import { MainApp, Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as casbin from '../../../../src';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    casbin
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerConfiguration {

  @App('koa')
  app;

  async onReady() {
  }
}
