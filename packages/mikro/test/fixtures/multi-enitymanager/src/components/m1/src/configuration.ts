import { Configuration, Inject, MidwayConfigService } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { Author } from './entity/author.entity';

@Configuration({
  namespace: 'm1',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BookConfiguration {

  @Inject()
  configService: MidwayConfigService;
  async onConfigLoad() {
    // 在组件加到应用定义的实例里
    const customEntities = this.configService.getConfiguration('mikro.dataSource.default.entities')
    // console.log(customEntities);
    customEntities.push(Author);
  }
}
