import { Configuration, App } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {

  @App()
  app;

  async onReady(container) {
  }
}
