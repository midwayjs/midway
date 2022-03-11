import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: {
    keys: '123'
  }
})
export class AutoConfiguration {
  async ready() {
    console.log('hello');
  }
}
