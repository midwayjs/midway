import { IInformationService } from '../interface';
import {
  getCurrentEnvironment,
  getUserHome,
  isDevelopmentEnvironment,
  safeRequire,
} from '../util';
import { dirname, join } from 'path';

export class MidwayInformationService implements IInformationService {
  protected pkg: Record<string, unknown>;
  private readonly appDir: string;
  private readonly baseDir: string;

  constructor(options: { baseDir?: string; appDir?: string }) {
    this.baseDir = options.baseDir;
    this.appDir = options.appDir;
    if (!this.appDir) {
      this.appDir = dirname(this.baseDir);
    }
    this.pkg = safeRequire(join(this.appDir, 'package.json')) || {};
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
