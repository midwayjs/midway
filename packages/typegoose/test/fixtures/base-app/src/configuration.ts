import { Configuration } from '@midwayjs/decorator';
import * as mongoose from '../../../../src';
import path from 'path'

@Configuration({
  imports: [mongoose],
  importConfigs: [path.join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(app){
    let res = await app.getAsync('testService');
    await res.getTest();
  }
}
