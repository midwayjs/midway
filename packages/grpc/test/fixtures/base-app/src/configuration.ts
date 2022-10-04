import { Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as grpc from '../../../../src';

@Configuration({
  imports: [
    grpc
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class AutoConfiguration {
}
