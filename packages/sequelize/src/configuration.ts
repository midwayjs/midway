import { Config, Configuration, listModule } from '@midwayjs/decorator';
import { Sequelize } from 'sequelize-typescript';
import * as path from 'path';

@Configuration({
  namespace: 'sequelize',
  importConfigs: [path.join(__dirname, 'config')]
})
export class SequelizeConfiguration {
  instance: Sequelize;

  @Config("sequelize")
  sequelizeConfig;

  async onReady() {
    const options = this.sequelizeConfig.options;
    this.instance = new Sequelize(options);
    const entities = listModule(`sequelize:core`);
    this.instance.addModels(entities)
    await this.instance.authenticate();
    if(this.sequelizeConfig.sync){
      await this.instance.sync();
    }
  }
}
