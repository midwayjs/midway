import { Configuration } from '@midwayjs/decorator';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [faas],
})
export class MainConfiguration {
}
