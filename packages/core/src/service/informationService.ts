import { IInformationService } from '../interface';
import { safeRequire } from '../util';
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
    return '';
  }

  getPkg(): any {
    return this.pkg;
  }

  getProjectName(): any {
    return (this.pkg?.['name'] as string) || '';
  }

  getRoot(): string {
    return '';
  }
}
