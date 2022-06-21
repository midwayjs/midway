import { Provide, Logger, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class LoggerService {
  @Logger()
  logger: any;

  getLogger() {
    return this.logger;
  }
}
