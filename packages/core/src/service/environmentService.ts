import { IEnvironmentService } from '../interface';
import { isDevelopmentEnvironment, getCurrentEnvironment } from '../util';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayEnvironmentService implements IEnvironmentService {
  environment: string;

  getCurrentEnvironment() {
    if (!this.environment) {
      this.environment = getCurrentEnvironment();
    }
    return this.environment;
  }

  setCurrentEnvironment(environment: string) {
    this.environment = environment;
  }

  isDevelopmentEnvironment() {
    return isDevelopmentEnvironment(this.environment);
  }
}
