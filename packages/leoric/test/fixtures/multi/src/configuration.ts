import { Configuration } from "@midwayjs/core";
import * as koa from '@midwayjs/koa';
import * as leoric from '../../../../src';
import * as path from 'path';

const { InjectDataSource } = leoric;

@Configuration({
  imports: [koa, leoric],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {
  @InjectDataSource()
  defaultDataSource: leoric.Realm;

  @InjectDataSource('custom')
  namedDataSource: leoric.Realm;

  @InjectDataSource('subsystem')
  subsystemDataSource: leoric.Realm;

  async onReady() {
    expect(this.defaultDataSource).toBeDefined();
    expect(this.defaultDataSource).toEqual(this.namedDataSource);
    expect(this.defaultDataSource).not.toEqual(this.subsystemDataSource);
    
  }
}
