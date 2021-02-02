import { Configuration, App } from '@midwayjs/decorator';
import { MidwayCustomContextLogger } from './logger';

@Configuration({
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {
  @App()
  app: any;

  async onReady() {
    this.app.setContextLoggerClass(MidwayCustomContextLogger);
  }
}
