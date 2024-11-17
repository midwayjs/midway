import { Configuration } from '@midwayjs/core';
import * as grpc from '../../../../src';
import { join } from 'path';

@Configuration({
  imports: [
    grpc
  ],
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class AutoConfiguration {
}
