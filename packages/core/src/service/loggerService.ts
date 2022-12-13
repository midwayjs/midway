import { Provide, Scope, Inject, Init, ScopeEnum } from '../decorator';
import { MidwayConfigService } from './configService';
import { ServiceFactory } from '../common/serviceFactory';
import { ILogger, IMidwayContainer } from '../interface';
import { LoggerFactory } from '../common/loggerFactory';
import { loggers } from '@midwayjs/logger';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  public configService: MidwayConfigService;

  private loggerFactory: LoggerFactory<any, any>;

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
    this.loggerFactory.createLogger(name, config);
  }

  getName() {
    return 'logger';
  }

  public createLogger(name, config) {
    return this.loggerFactory.createLogger(name, config);
  }

  public getLogger(name: string) {
    return this.loggerFactory.getLogger(name);
  }

  public getCurrentLoggerFactory(): LoggerFactory<any, any> {
    return this.loggerFactory;
  }
}
