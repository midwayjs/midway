import { CommonJSFileDetector, Configuration } from '@midwayjs/core';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [faas],
  detector: new CommonJSFileDetector(),
})
export class MainConfiguration {
}
