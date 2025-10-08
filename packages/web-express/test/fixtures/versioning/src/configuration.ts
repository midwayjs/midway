import { Configuration, Inject } from '@midwayjs/core';
import * as express from '../../../../src';
import { join } from 'path';

@Configuration({
  imports: [
    express
  ],
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class AutoConfiguration {
  @Inject()
  framework: express.Framework;
}