import { Configuration, Logger, MainApp } from '../../../../src';
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

  @MainApp()
  app: IMidwayApplication;

  @Logger()
  logger: ILogger;

  async onReady() {
  }
}
