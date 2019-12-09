import { ICommand, IHooks, IProvider } from '../interface/midwayServerless';
export { ICommand, IHooks, IProvider } from '../interface/midwayServerless';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
export abstract class CommandBase {

  provider?: IProvider;
  serverless: any;
  options: any;
  isTsDir: boolean;
  servicePath: string;
  midwayBuildPath: string;
  config: string;

  public constructor(provider?: IProvider) {
    if (provider) {
      this.provider = provider;
      this.serverless = provider.serverless;
      this.options = this.serverless.processedInput.options;
      this.config = this.serverless.pluginManager.serverlessConfigFile;
      this.servicePath = this.serverless.config.servicePath;
      this.midwayBuildPath = join(this.servicePath, '.serverless');
      this.isTsDir = existsSync(join(this.servicePath, 'tsconfig.json'));
    }
  }

  public abstract getCommand(): ICommand;
  public abstract getHooks(): IHooks;

  // 安装npm到构建文件夹
  async npmInstall(npmList?: string[]) {
    return new Promise((resolve, reject) => {
      const pkgJson: string = join(this.midwayBuildPath, 'package.json');
      if (!existsSync(pkgJson)) {
        writeFileSync(pkgJson, '{}');
      }
      exec(`cd ${this.midwayBuildPath};${this.options.npm || 'npm'} install ${npmList ? `${npmList.join(' ')}` : '--production'}`, (err) => {
        if (err) {
          const errmsg = err && err.message || err;
          this.serverless.cli.log(` - npm install err ${errmsg}`);
          reject(errmsg);
        } else {
          resolve(true);
        }
      });
    });
  }

  // 耗时计算
  tick() {
    const timeStart = Date.now();
    return () => {
      return Date.now() - timeStart;
    };
  }
}
