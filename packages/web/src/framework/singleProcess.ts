import {
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  MidwayConfigService,
  MidwayFrameworkType,
  MidwayLoggerService,
  PathFileUtil,
} from '@midwayjs/core';
import {
  IMidwayWebConfigurationOptions,
  IMidwayWebApplication,
} from '../interface';
import { resolve } from 'path';
import { Server } from 'net';
import { LoggerOptions } from '@midwayjs/logger';
import { Init, Inject } from '@midwayjs/decorator';
import { MidwayEggContextLogger } from '../logger';

export class MidwayWebSingleProcessFramework {
  public app: IMidwayWebApplication;
  public agent;
  public configurationOptions: IMidwayWebConfigurationOptions;
  private isTsMode: boolean;
  private server: Server;

  @Inject()
  loggerService: MidwayLoggerService;

  @Inject()
  configService: MidwayConfigService;

  @Init()
  async init() {
    this.configure(
      this.configService.getConfiguration(this.getFrameworkName())
    );
    return this;
  }

  public getApplication() {
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
        const args: any[] = [this.configurationOptions.port];
        if (this.configurationOptions.hostname) {
          args.push(this.configurationOptions.hostname);
        }
        args.push(() => {
          resolve();
        });
        this.server.listen(...args);
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
    const opts = {
      baseDir: options.appDir,
      framework: resolve(__dirname, '../application'),
      plugins: this.configurationOptions.plugins,
      mode: 'single',
      isTsMode: this.isTsMode || true,
      applicationContext: options.applicationContext,
      midwaySingleton: true,
    };

    const Agent = require(opts.framework).Agent;
    const Application = require(opts.framework).Application;
    const agent = (this.agent = new Agent(Object.assign({}, opts)));
    await agent.ready();
    const application = (this.app = new Application(Object.assign({}, opts)));
    application.agent = agent;
    agent.application = application;

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

      if (this.configurationOptions.http2) {
        this.server = require('http2').createSecureServer(
          this.configurationOptions,
          this.app.callback()
        );
      } else {
        this.server = require('https').createServer(
          this.configurationOptions,
          this.app.callback()
        );
      }
    } else {
      if (this.configurationOptions.http2) {
        this.server = require('http2').createServer(this.app.callback());
      } else {
        this.server = require('http').createServer(this.app.callback());
      }
    }

    // if (options.isMainFramework === undefined) {
    await this.loadExtension();
    // }
  }

  async loadExtension() {
    // 延迟加载 egg 的 load 方法
    await (this.app.loader as any).loadOrigin();
    await this.app.ready();

    // emit egg-ready message in agent and application
    this.app.messenger.broadcast('egg-ready', undefined);

    // emit `server` event in app
    this.app.emit('server', this.server);
    // register httpServer to applicationContext
    this.getApplicationContext().registerObject(HTTP_SERVER_KEY, this.server);
  }

  async stop(): Promise<void> {
    await new Promise(resolve => {
      this.server.close(resolve);
    });
    await this.app.close();
    await this.agent.close();
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
    return 'egg';
  }

  public getDefaultContextLoggerClass() {
    return MidwayEggContextLogger;
  }
}
