import {
  Configuration,
  App,
  ESModuleFileDetector,
  IMidwayContainer,
  ILifeCycle,
} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validation from '@midwayjs/validation';
import * as info from '@midwayjs/info';
// import { DefaultErrorFilter } from './filter/default.filter.js';
// import { NotFoundFilter } from './filter/notfound.filter.js';
import { ReportMiddleware } from './middleware/report.middleware.js';
import DefaultConfig from './config/config.default.js';
import UnittestConfig from './config/config.unittest.js';

@Configuration({
  imports: [
    koa,
    validation,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
  detector: new ESModuleFileDetector(),
})
export class MainConfiguration implements ILifeCycle {
  @App('koa')
  app: koa.Application;

  async onReady(container: IMidwayContainer) {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
