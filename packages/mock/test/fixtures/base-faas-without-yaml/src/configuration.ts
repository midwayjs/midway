import { Configuration } from '@midwayjs/core';
import * as faas from '../../../../../faas';
@Configuration({
  imports: [faas]
})
export class ContainerConfiguration {
  async onReady() {
  }
}
