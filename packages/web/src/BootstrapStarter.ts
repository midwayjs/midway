import { BootstrapStarter } from '@midwayjs/bootstrap';

export class WebBootstrapStarter extends BootstrapStarter {
  public async init() {
    this.appDir = this.globalOptions.appDir || process.cwd();
    this.baseDir = this.getBaseDir();

    await this.getActions('initialize', {
      ...this.globalOptions,
      baseDir: this.baseDir,
      appDir: this.appDir,
    });
  }
}
