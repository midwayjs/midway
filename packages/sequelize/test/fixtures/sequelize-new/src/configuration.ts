import { Configuration } from '@midwayjs/core';
import * as sequelize from '../../../../src';
import * as path from 'path'
import { InjectDataSource } from '../../../../src/decorator';
import { Sequelize } from 'sequelize-typescript';

@Configuration({
  imports: [sequelize],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')]
})
export class ContainerLifeCycle {

  @InjectDataSource()
  defaultDataSource: Sequelize;

  @InjectDataSource('custom')
  namedDataSource: Sequelize;

  async onReady() {
    expect(this.defaultDataSource).toBeDefined();
    expect(this.defaultDataSource).toEqual(this.namedDataSource);
  }
}
