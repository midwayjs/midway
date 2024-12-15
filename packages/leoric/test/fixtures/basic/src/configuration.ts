import { Configuration } from "@midwayjs/core";
import * as leoric from '../../../../src';
import * as path from 'path';

const { InjectDataSource } = leoric;

@Configuration({
  imports: [leoric],
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {
  @InjectDataSource()
  defaultDataSource: leoric.Realm;

  @InjectDataSource('custom')
  namedDataSource: leoric.Realm;

  async onReady() {
    expect(this.defaultDataSource).toBeDefined();
    expect(this.defaultDataSource).toEqual(this.namedDataSource);
  }
}
