import { Configuration, Inject } from '@midwayjs/decorator';
import * as bull from '../../../../src';

@Configuration({
  imports: [
    bull
  ],
})
export class ContainerConfiguration {

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {

  }
}
