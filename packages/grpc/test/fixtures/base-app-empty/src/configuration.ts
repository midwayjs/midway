import { Configuration } from '@midwayjs/core';
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
