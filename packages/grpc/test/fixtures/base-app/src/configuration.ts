import { Configuration } from '@midwayjs/decorator';
import * as grpc from '../../../../src';

@Configuration({
  imports: [
    grpc
  ],
})
export class AutoConfiguration {
}
