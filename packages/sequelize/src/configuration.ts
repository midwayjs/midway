import { Config, Configuration, listModule } from '@midwayjs/decorator';
import { Sequelize } from 'sequelize-typescript';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'sequelize',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class SequelizeConfiguration {
  instance: Sequelize;

  @Config('sequelize')
  sequelizeConfig;

  async onReady() {
    const options = this.sequelizeConfig.options;
    this.instance = new Sequelize(options);
    const entities = listModule('sequelize:core');
    this.instance.addModels(entities);
    await this.instance.authenticate();
    if (this.sequelizeConfig.sync) {
      await this.instance.sync();
    }
  }
}
