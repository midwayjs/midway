import { Configuration } from '@midwayjs/decorator';
import * as typegoose from '../../../../src';
import { join } from 'path'
import { TestService } from './service/test';

@Configuration({
  imports: [typegoose],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(app){
    let res = await app.getAsync(TestService);
    await res.getTest();
  }
}
