import { Configuration, App, Logger } from '../../../../src';
import { IMidwayApplication } from '../../../../src';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  importConfigs: {
    midwayLogger: {
      default: {
        enableFile: false,
        enableError: false,
      },
      clients: {
        customLogger: {
          enableConsole: true,
        }
      }
    }
  }
})
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;

  @Logger()
  logger: ILogger;

  async onReady() {
  }
}
