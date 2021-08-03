import { Configuration } from '@midwayjs/decorator';
import * as metrics from '../../../../src';


@Configuration({
  imports: [metrics]
})
export class AutoConfiguration {
}
