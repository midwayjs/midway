import { IEnvironmentService } from '../interface';
import { isDevelopmentEnvironment, getCurrentEnvironment } from '../util';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayEnvironmentService implements IEnvironmentService {
  protected environment: string;

  public getCurrentEnvironment() {
    if (!this.environment) {
      this.environment = getCurrentEnvironment();
    }
    return this.environment;
  }

  public setCurrentEnvironment(environment: string) {
    this.environment = environment;
  }

  public isDevelopmentEnvironment() {
    return isDevelopmentEnvironment(this.environment);
  }
}
