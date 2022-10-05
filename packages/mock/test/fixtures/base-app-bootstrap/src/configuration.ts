import { Configuration } from '@midwayjs/core';

@Configuration({
  imports: [
    require('../../../../../web-koa')
  ],
  importConfigs: {
    keys: '123'
  }
})
export class ContainerConfiguration {
  async onReady() {
  }
}
