import { CommonJSFileDetector, Configuration } from '@midwayjs/core';
import * as faas from '../../../../../faas';
@Configuration({
  imports: [faas],
  detector: new CommonJSFileDetector(),
})
export class ContainerConfiguration {
  async onReady() {
  }
}
