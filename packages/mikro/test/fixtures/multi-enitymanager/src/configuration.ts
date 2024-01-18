import { Configuration, App, MidwayConfigService, Inject, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import * as mikro from '../../../../src';
import * as m1 from './components/m1/src';

@Configuration({
  imports: [
    koa,
    mikro,
    m1,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  @Inject()
  configService: MidwayConfigService;
  async onReady(container: IMidwayContainer) {
    // 开发环境同步生成创建表
    const dataSourceManager = await container.getAsync(mikro.MikroDataSourceManager);
    for (const [_, dataSource] of dataSourceManager.getAllDataSources()) {
      const generator = dataSource.getSchemaGenerator();
      await generator.createSchema();
    }
  }
}
