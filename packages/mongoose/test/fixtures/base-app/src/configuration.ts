import { Configuration } from '@midwayjs/decorator';
import * as mongoose from '../../../../src';
import { join } from 'path'

@Configuration({
  imports: [mongoose],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(app){
  }
}
