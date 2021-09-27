import { Configuration } from '@midwayjs/decorator';
import * as view from '../../../../src';
import { join } from 'path'

@Configuration({
  imports: [view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(){
  }
}
