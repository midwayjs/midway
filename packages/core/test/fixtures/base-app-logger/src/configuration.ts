import { Configuration, App, Logger } from '@midwayjs/decorator';
import { IMidwayApplication } from '../../../../src';
import * as assert from 'assert';
import { ILogger } from '@midwayjs/logger';

@Configuration()
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;

  @Logger()
  logger: ILogger;

  async onReady() {
    const otherLogger = this.app.createLogger('otherLogger', {
      disableFile: true,
      disableError: true,
    })

    assert(otherLogger === this.app.getLogger('otherLogger'));
    assert(this.logger === this.app.getLogger('logger'));
  }
}
