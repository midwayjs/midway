import { Provide, Scope, Inject, Init } from '../decorator';
import { MidwayConfigService } from './configService';
import { ServiceFactory } from '../common/serviceFactory';
import { ILogger, IMidwayContainer, ScopeEnum } from '../interface';
import { LoggerFactory } from '../common/loggerFactory';
import { loggers } from '@midwayjs/logger';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  public configService: MidwayConfigService;

  private loggerFactory: LoggerFactory<any, any>;

  private lazyLoggerConfigMap: Map<string, any> = new Map();

  constructor(
    readonly applicationContext: IMidwayContainer,
    readonly globalOptions = {}
  ) {
    super();
  }

  @Init()
  protected init() {
    this.loggerFactory = this.globalOptions['loggerFactory'] || loggers;
    this.initClients(this.configService.getConfiguration('midwayLogger'));
    // alias inject logger
    this.applicationContext?.registerObject(
      'logger',
      this.getLogger('appLogger')
    );
  }

  protected createClient(config, name?: string) {
    if (!config.lazyLoad) {
      this.loggerFactory.createLogger(name, config);
    } else {
      delete config['lazyLoad'];
      this.lazyLoggerConfigMap.set(name, config);
    }
  }

  getName() {
    return 'logger';
  }

  public createLogger(name, config) {
    return this.loggerFactory.createLogger(name, config);
  }

  public getLogger(name: string) {
    const logger = this.loggerFactory.getLogger(name);
    if (logger) {
      return logger;
    }

    if (this.lazyLoggerConfigMap.has(name)) {
      // try to lazy init
      this.createClient(this.lazyLoggerConfigMap.get(name), name);
      this.lazyLoggerConfigMap.delete(name);
    }
    return this.loggerFactory.getLogger(name);
  }

  public getCurrentLoggerFactory(): LoggerFactory<any, any> {
    return this.loggerFactory;
  }
}
