import { IEnvironmentService, ScopeEnum } from '../interface';
import { isDevelopmentEnvironment, getCurrentEnvironment } from '../util';
import { Provide, Scope } from '../decorator';

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
