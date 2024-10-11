import { Configuration, MainApp, Logger, Provide } from '../../../../src';
import { IMidwayApplication } from '../../../../src';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {
  async invoke() {
    return 'hello world';
  }
}

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
