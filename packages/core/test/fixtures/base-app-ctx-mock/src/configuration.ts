import { Configuration, App, Logger, Provide } from '../../../../src';
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

  @App()
  app: IMidwayApplication;

  @Logger()
  logger: ILogger;

  async onReady() {
  }
}
