import { Configuration, ILifeCycle } from '@midwayjs/core';
import * as consul from '../../../../src';
import * as Koa from '@midwayjs/koa';
import { join } from 'path';

@Configuration({
  imports: [Koa, consul],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {
  async onReady() {}
}
