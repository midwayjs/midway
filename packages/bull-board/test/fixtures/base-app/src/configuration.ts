import { Configuration } from '@midwayjs/decorator';
import * as bull from '../../../../src';

@Configuration({
  imports: [
    bull
  ],
})
export class ContainerConfiguration {

  async onReady() {

  }
}
