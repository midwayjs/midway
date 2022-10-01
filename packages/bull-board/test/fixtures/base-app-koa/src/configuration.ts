import { Configuration } from '@midwayjs/decorator';
import * as bullBoard from '../../../../src';
import { join } from 'path'
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa, bullBoard],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(){
  }
}
