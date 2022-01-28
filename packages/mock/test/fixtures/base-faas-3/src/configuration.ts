import { Configuration } from '@midwayjs/decorator';
import * as faas from '../../../../../faas';
@Configuration({
  imports: [faas]
})
export class ContainerConfiguration {
  async onReady() {
  }
}
