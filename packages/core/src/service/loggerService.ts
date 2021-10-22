import {
  Provide,
  Scope,
  ScopeEnum,
  Inject,
  Init,
  Destroy,
} from '@midwayjs/decorator';
import { MidwayConfigService } from './configService';
import { ServiceFactory } from '../util/serviceFactory';
import { ILogger, loggers } from '@midwayjs/logger';
import { IMidwayContainer } from '../interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  configService: MidwayConfigService;

  constructor(readonly applicationContext: IMidwayContainer) {
    super();
  }

  @Init()
  async init() {
    await this.initClients(this.configService.getConfiguration('midwayLogger'));
    // alias inject logger
    this.applicationContext?.registerObject(
      'logger',
      this.getLogger('appLogger')
    );
  }

  protected async createClient(config, name?: string) {
    loggers.createLogger(name, config);
  }

  getName() {
    return 'logger';
  }

  @Destroy()
  async destroy() {
    loggers.close();
  }

  createLogger(name, config) {
    return loggers.createLogger(name, config);
  }

  getLogger(name: string) {
    return loggers.getLogger(name);
  }
}
