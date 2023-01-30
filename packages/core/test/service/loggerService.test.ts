import {
  LoggerFactory,
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  MidwayLoggerService
} from '../../src';

class MockLoggerFactory extends LoggerFactory<any, any> {
  maps = new Map();
  close(loggerName: string | undefined) {
    this.maps.clear();
  }

  createLogger(name: string, options: any): any {
    this.maps.set(name, options);
  }

  getLogger(loggerName: string): any {
    return this.maps.get(loggerName);
  }

  removeLogger(loggerName: string) {
  }
}

describe('/test/service/loggerService.test.ts', () => {
  it('should create loggerService', async () => {
    const container = new MidwayContainer();
    container.bindClass(MidwayEnvironmentService);
    container.bindClass(MidwayInformationService);
    container.bindClass(MidwayConfigService)
    container.bindClass(MidwayLoggerService);

    container.registerObject('baseDir', '');
    container.registerObject('appDir', '');

    const configService = await container.getAsync(MidwayConfigService);

    configService.addObject({
      midwayLogger: {
        default: {
          consoleLevel: 'DEBUG',
        },
        clients: {
          customLoggerA: {
            level: 'DEBUG',
          },
          customLoggerB: {
            level: 'INFO',
            lazyLoad: true,
          },
        }
      }
    });

    configService.load();

    const loggerService = await container.getAsync(MidwayLoggerService, [container, {
      loggerFactory: new MockLoggerFactory(),
    }]);

    const customLoggerA = loggerService.getLogger('customLoggerA');
    expect(customLoggerA).toBeDefined();

    const loggerFactory = loggerService.getCurrentLoggerFactory();
    const customLoggerB = loggerFactory.getLogger('customLoggerB');

    expect(customLoggerB).toBeUndefined();

    const customLogger = loggerService.getLogger('customLoggerB');
    expect(customLogger).toBeDefined();
  });
});
