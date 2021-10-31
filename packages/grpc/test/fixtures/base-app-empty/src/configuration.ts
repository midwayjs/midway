import { Configuration } from '@midwayjs/decorator';
import * as grpc from '../../../../src';

@Configuration({
  imports: [
    grpc
  ],
  importConfigs: [
  ]
})
export class AutoConfiguration {
}
