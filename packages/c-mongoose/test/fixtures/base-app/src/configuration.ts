import { Configuration } from '@midwayjs/decorator';
import * as mongoose from '../../../../src';

@Configuration({
  imports: [mongoose]
})
export class AutoConfiguration {

  async onReady(app){
    let res = await app.getAsync('testService');
    await res.getTest();
  }
}
