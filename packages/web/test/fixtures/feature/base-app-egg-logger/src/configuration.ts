import { Configuration, Logger, App } from '@midwayjs/decorator';
import * as assert from 'assert';
import { Application } from 'egg';

@Configuration({
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {

  @Logger()
  logger;

  @App()
  app: Application;

  async onReady() {
    assert(this.logger.get('file'));
    assert(this.logger === this.app.logger);
  }
}
