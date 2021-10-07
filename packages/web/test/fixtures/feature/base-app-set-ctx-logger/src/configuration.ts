import { Configuration, App } from '@midwayjs/decorator';
import { MidwayCustomContextLogger } from './logger';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
  @App()
  app: any;

  async onReady() {
    this.app.createAnonymousContext().logger.warn('aaaaa');
    this.app.setContextLoggerClass(MidwayCustomContextLogger);
    this.app.createAnonymousContext().logger.warn('ccccc');
  }
}
