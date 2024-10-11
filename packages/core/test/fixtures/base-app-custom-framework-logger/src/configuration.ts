import { Configuration, Logger, MainApp, IMidwayApplication, ILogger } from '../../../../src';

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
