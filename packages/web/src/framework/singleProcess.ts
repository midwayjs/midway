import {
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
  MidwayFrameworkType,
  PathFileUtil,
} from '@midwayjs/core';
import { IMidwayWebConfigurationOptions } from '../interface';
import { Application } from 'egg';
import { resolve } from 'path';
import { Server } from 'net';
import { LoggerOptions } from '@midwayjs/logger';
import { MidwayKoaContextLogger } from '@midwayjs/koa';

export class MidwayWebSingleProcessFramework
  implements IMidwayFramework<Application, IMidwayWebConfigurationOptions> {
  public app: Application;
  public configurationOptions: IMidwayWebConfigurationOptions;
  private isTsMode: boolean;
  private server: Server;

  public getApplication(): Application {
    return this.app;
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  public async run(): Promise<void> {
    // trigger server didReady
    this.app.messenger.emit('egg-ready');

    if (this.configurationOptions.port) {
      new Promise<void>(resolve => {
        this.server.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }

  configure(
    options: IMidwayWebConfigurationOptions = {}
  ): MidwayWebSingleProcessFramework {
    this.configurationOptions = options;
    return this;
  }

  getApplicationContext(): IMidwayContainer {
    return this.app.getApplicationContext();
  }

  getConfiguration(key?: string): any {
    return this.app.getConfig(key);
  }

  getCurrentEnvironment(): string {
    return this.app.getEnv();
  }

  async initialize(options: Partial<IMidwayBootstrapOptions>) {
    const { start } = require('egg');
    this.app = await start({
      baseDir: options.appDir,
      ignoreWarning: true,
      framework: resolve(__dirname, '../application'),
      plugins: this.configurationOptions.plugins,
      mode: 'single',
      isTsMode: this.isTsMode || true,
      applicationContext: options.applicationContext,
    });
    // https config
    if (this.configurationOptions.key && this.configurationOptions.cert) {
      this.configurationOptions.key = PathFileUtil.getFileContentSync(
        this.configurationOptions.key
      );
      this.configurationOptions.cert = PathFileUtil.getFileContentSync(
        this.configurationOptions.cert
      );
      this.configurationOptions.ca = PathFileUtil.getFileContentSync(
        this.configurationOptions.ca
      );

      this.server = require('https').createServer(
        this.configurationOptions,
        this.app.callback()
      );
    } else {
      this.server = require('http').createServer(this.app.callback());
    }

    // emit `server` event in app
    this.app.emit('server', this.server);
    // register httpServer to applicationContext
    this.getApplicationContext().registerObject(HTTP_SERVER_KEY, this.server);
  }

  async stop(): Promise<void> {
    await this.app.close();
  }

  getBaseDir(): string {
    return this.app.getBaseDir();
  }

  getAppDir(): string {
    return this.app.getAppDir();
  }

  public getLogger(name?: string) {
    return this.app.getLogger(name);
  }

  getCoreLogger() {
    return this.app.coreLogger;
  }

  getProjectName(): string {
    return this.app.getProjectName();
  }

  createLogger(name: string, options?: LoggerOptions) {
    return this.app.createLogger(name, options);
  }

  public getServer() {
    return this.server;
  }

  public getFrameworkName() {
    return 'midway:web';
  }

  public getDefaultContextLoggerClass() {
    return MidwayKoaContextLogger;
  }

  public loadLifeCycles() {}
}
