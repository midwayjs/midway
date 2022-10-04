import { IInformationService } from '../interface';
import {
  getCurrentEnvironment,
  getUserHome,
  isDevelopmentEnvironment,
  safeRequire,
} from '../util';
import { dirname, join } from 'path';
import { Provide, Inject, Init, Scope, ScopeEnum } from '../decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayInformationService implements IInformationService {
  private pkg: Record<string, unknown>;

  @Inject()
  protected appDir: string;

  @Inject()
  protected baseDir: string;

  @Init()
  protected init() {
    if (this.baseDir) {
      if (!this.appDir) {
        this.appDir = dirname(this.baseDir);
      }
      this.pkg = safeRequire(join(this.appDir, 'package.json')) || {};
    } else {
      this.pkg = {};
    }
  }

  getAppDir(): string {
    return this.appDir;
  }

  getBaseDir(): string {
    return this.baseDir;
  }

  getHome(): string {
    return getUserHome();
  }

  getPkg(): any {
    return this.pkg;
  }

  getProjectName(): string {
    return (this.pkg?.['name'] as string) || '';
  }

  getRoot(): string {
    const isDevelopmentEnv = isDevelopmentEnvironment(getCurrentEnvironment());
    return isDevelopmentEnv ? this.getAppDir() : this.getHome();
  }
}
