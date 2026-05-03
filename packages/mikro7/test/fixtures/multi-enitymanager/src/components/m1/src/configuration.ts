import midwayCore, {
  type MidwayConfigService as MidwayConfigServiceType,
} from '@midwayjs/core';
import DefaultConfig from './config/config.default.js';
import { Author } from './entity/author.entity.js';
import { join } from 'path';

const { Configuration, Inject, ESModuleFileDetector } = midwayCore;
const componentDir = join(
  process.env.MIKRO7_FIXTURES_DIR,
  'multi-enitymanager/src/components/m1/src'
);

@Configuration({
  namespace: 'm1',
  detector: new ESModuleFileDetector({
    loadDir: componentDir,
    ignore: ['**/configuration.ts', '**/config/**', '**/.midway-esm-fallback*/**'],
  }),
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BookConfiguration {

  @Inject('midwayConfigService')
  configService: MidwayConfigServiceType;
  async onConfigLoad() {
    // 在组件加到应用定义的实例里
    const customEntities = this.configService.getConfiguration('mikro.dataSource.default.entities')
    // console.log(customEntities);
    customEntities.push(Author);
  }
}
