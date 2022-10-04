import { Configuration, App } from '@midwayjs/core';
import { join } from 'path';
import { IMidwayKoaApplication } from '../../../../src';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayKoaApplication;

  async onReady(container) {
  }
}
