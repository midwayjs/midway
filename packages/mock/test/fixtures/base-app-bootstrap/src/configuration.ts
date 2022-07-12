import { Configuration } from '@midwayjs/decorator';

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
