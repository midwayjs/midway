import { Configuration, Logger, App } from '@midwayjs/core';
import * as assert from 'assert';
import { Application } from 'egg';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @Logger()
  logger;

  @App()
  app: Application;

  async onReady() {
    assert.ok(this.logger.get('file'));
    assert.ok(this.logger === this.app.logger);
  }
}
