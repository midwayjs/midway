import { IEnvironmentService, ModuleLoadType, ScopeEnum } from '../interface';
import { isDevelopmentEnvironment, getCurrentEnvironment } from '../util';
import { Provide, Scope } from '../decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayEnvironmentService implements IEnvironmentService {
  protected environment: string;
  protected moduleLoadType: ModuleLoadType = 'commonjs';

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

  public setModuleLoadType(moduleLoadType: ModuleLoadType) {
    this.moduleLoadType = moduleLoadType;
  }

  public getModuleLoadType() {
    return this.moduleLoadType;
  }

  public isPkgEnvironment() {
    return typeof process['pkg'] !== 'undefined';
  }
}
