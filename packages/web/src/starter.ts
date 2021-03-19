import { BootstrapStarter } from '@midwayjs/bootstrap';

interface WebStarterOptions {
  isWorker: boolean;
}

export class WebBootstrapStarter extends BootstrapStarter {
  options: WebStarterOptions;

  constructor(options: WebStarterOptions) {
    super();
    this.options = options;
  }

  public async init() {
    this.appDir = this.globalOptions.appDir || process.cwd();
    this.baseDir = this.getBaseDir();

    await this.getFirstActions('initialize', {
      ...this.globalOptions,
      baseDir: this.baseDir,
      appDir: this.appDir,
      isMainFramework: this.options.isWorker ? true : undefined,
    });
  }
}
