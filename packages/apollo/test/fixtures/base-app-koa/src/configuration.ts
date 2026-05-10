import { Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as koa from '@midwayjs/koa';
import * as apollo from '../../../../src';

@Configuration({
  imports: [koa, apollo],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerConfiguration {}
