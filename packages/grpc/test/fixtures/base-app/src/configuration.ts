import { Configuration } from '@midwayjs/decorator';
import * as grpc from '../src/../../../../src';

@Configuration({
  imports: [
    grpc
  ]
})
export class AutoConfiguration {
  async onReady() {
    console.log('on ready and load grpc component');
  }
}
