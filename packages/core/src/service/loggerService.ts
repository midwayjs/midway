import { Provide, Scope, ScopeEnum, Inject, Init } from '@midwayjs/decorator';
import { MidwayConfigService } from './configService';
import { ServiceFactory } from '../common/serviceFactory';
import { ILogger, loggers } from '@midwayjs/logger';
import { IMidwayContainer } from '../interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  public configService: MidwayConfigService;

  constructor(readonly applicationContext: IMidwayContainer) {
    super();
  }

  @Init()
  protected init() {
    this.initClients(this.configService.getConfiguration('midwayLogger'));
    // alias inject logger
    this.applicationContext?.registerObject(
      'logger',
      this.getLogger('appLogger')
    );
  }

  protected createClient(config, name?: string) {
    loggers.createLogger(name, config);
  }

  getName() {
    return 'logger';
  }

  public createLogger(name, config) {
    return loggers.createLogger(name, config);
  }

  public getLogger(name: string) {
    return loggers.getLogger(name);
  }
}
