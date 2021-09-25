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

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  configService: MidwayConfigService;

  @Init()
  async init() {
    await this.initClients(this.configService.getConfiguration('midwayLogger'));
  }

  protected createClient(config, name?: string) {
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
