import { Configuration } from '@midwayjs/core';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [faas],
})
export class MainConfiguration {
}
