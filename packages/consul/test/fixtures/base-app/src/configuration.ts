import { Configuration } from '@midwayjs/decorator';
import * as consul from '../../../../src';
import * as Koa from '@midwayjs/koa';
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import {join} from 'path';

@Configuration({
  imports: [
    Koa,
    consul
  ],
  importConfigs: [join(__dirname, 'config')]
})
export class ContainerConfiguration implements ILifeCycle {
  async onReady(container: IMidwayContainer, app?: IMidwayApplication) {
    // console.info(app.getConfig());
    // const collector = new WebRouterCollector();
    // console.log(await collector.getFlattenRouterTable());
  }
}
