import { Configuration } from '@midwayjs/core';
import * as koa from '../../../../src';
import { join } from 'path';

@Configuration({
  imports: [koa],
  importConfigs: [join(__dirname, './config')]
})
export class ContainerLifeCycle {}