import midwayCore, {
  type MidwayConfigService as MidwayConfigServiceType,
  type IMidwayContainer,
} from '@midwayjs/core';
import koa from '@midwayjs/koa';
import { join } from 'path';
import * as mikro from '../../../../src/index.js';
import * as m1 from './components/m1/src/index.js';
import DefaultConfig from './config/config.default.js';

const appDir = join(process.env.MIKRO7_FIXTURES_DIR, 'multi-enitymanager');
const { Configuration, App, Inject, ESModuleFileDetector } = midwayCore;

@Configuration({
  imports: [
    koa,
    mikro,
    m1,
  ],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
  detector: new ESModuleFileDetector({
    ignore: [
      '**/configuration.ts',
      '**/config/**',
      'components/**',
      '**/components/**',
      '**/components/**/*',
      '**/.midway-esm-fallback*/**',
    ],
  }),
})
export class MainConfiguration {
  @App('koa')
  app: import('@midwayjs/koa').Application;

  @Inject('midwayConfigService')
  configService: MidwayConfigServiceType;
  async onReady(container: IMidwayContainer) {
    // 开发环境同步生成创建表
    const dataSourceManager = await container.getAsync(mikro.MikroDataSourceManager);
    for (const [_, dataSource] of dataSourceManager.getAllDataSources()) {
      await dataSource.schema.create();
    }
  }
}
