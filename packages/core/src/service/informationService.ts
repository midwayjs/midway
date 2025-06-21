import { IInformationService, ScopeEnum } from '../interface';
import {
  getCurrentEnvironment,
  getUserHome,
  isDevelopmentEnvironment,
} from '../util';
import { dirname, join } from 'path';
import { Provide, Inject, Init, Scope } from '../decorator';
import { existsSync, readFileSync } from 'fs';
import { NetworkUtils } from '../util/network';

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
      const pkgPath = join(this.appDir, 'package.json');
      if (existsSync(pkgPath)) {
        const content = readFileSync(pkgPath, {
          encoding: 'utf-8',
        });
        this.pkg = JSON.parse(content);
      } else {
        this.pkg = {};
      }
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

  getHostname(): string {
    return NetworkUtils.getHostname();
  }

  getIpv4Address(): string {
    return NetworkUtils.getIpv4Address();
  }

  getIpv6Address(): string {
    return NetworkUtils.getIpv6Address();
  }
}
