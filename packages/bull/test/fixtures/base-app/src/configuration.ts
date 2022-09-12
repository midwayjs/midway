import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as bull from '../../../../src';

@Configuration({
  imports: [
    bull
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  async onReady() {

  }
}
