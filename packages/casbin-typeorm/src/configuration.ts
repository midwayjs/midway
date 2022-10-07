import { Config, Configuration, IMidwayContainer, Inject } from '@midwayjs/core';
import * as typeorm from '@midwayjs/typeorm';
import * as casbin from '@midwayjs/casbin';
import TypeORMAdapter from 'typeorm-adapter';
import { CasbinTypeORMConfigOptions } from './interface';

@Configuration({
  namespace: 'casbin-typeorm',
  imports: [
    typeorm,
    casbin,
  ],
  importConfigs: [
    {
      default: {
        casbinTypeORM: {
          dataSourceKey: 'casbin'
        },
      },
    },
  ],
})
export class CasbinTypeORMConfiguration {

  @Inject()
  casbinAdapterManager: casbin.CasbinAdapterManager;

  @Config('casbinTypeORM')
  casbinTypeORMConfig: CasbinTypeORMConfigOptions;

  async onReady(container: IMidwayContainer) {
    const dataSourceManager = await container.getAsync(typeorm.TypeORMDataSourceManager);
    const dataSource = await dataSourceManager.getDataSource(this.casbinTypeORMConfig.dataSourceKey);

    const adapter = await TypeORMAdapter.newAdapter({
      connection: dataSource,
    });
    this.casbinAdapterManager.setAdapter(adapter);
  }
}
