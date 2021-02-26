import {
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayContext,
  IMidwayFramework,
  MidwayFrameworkType,
} from '@midwayjs/core';

import { Server } from 'net';
import { start2 } from './start';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { getSpecFile, loadSpec } from '@midwayjs/serverless-spec-builder';
import { createExpressGateway } from '@midwayjs/gateway-common-http';
import { findNpmModule, output404 } from './utils';
import { Locator } from '@midwayjs/locate';
import { StarterMap, TriggerMap } from './platform';

import { IServerlessApp, IServerlessAppOptions } from './interface';

export * from './interface';
export class Framework
  implements IMidwayFramework<IServerlessApp, IServerlessAppOptions> {
  app: IServerlessApp;
  configurationOptions: IServerlessAppOptions;
  private innerApp: IMidwayApplication;
  private innerFramework: IMidwayFramework<any, any>;
  private runtime: any;
  private server: Server;
  private bootstrapOptions;
  private spec;
  configure(options: IServerlessAppOptions) {
    this.configurationOptions = options;
    return this;
  }
  async stop() {
    if (this.server?.close) {
      this.server.close();
    }
  }

  getApplicationContext(): IMidwayContainer {
    return this.innerApp.getApplicationContext();
  }

  getConfiguration(key?: string): any {
    return this.innerApp.getConfig(key);
  }

  getCurrentEnvironment(): string {
    return this.innerApp.getEnv();
  }
  getAppDir(): string {
    return this.innerApp.getAppDir();
  }

  getLogger(name?: string): any {
    return this.innerApp.getLogger(name);
  }
  getBaseDir(): string {
    return this.innerApp.getBaseDir();
  }
  getCoreLogger() {
    return (this.innerApp as any).coreLogger;
  }
  createLogger(name: string, options?: any): any {
    return this.innerApp.createLogger(name, options);
  }
  getProjectName(): string {
    return this.innerApp.getProjectName();
  }
  public getDefaultContextLoggerClass() {
    return this.innerFramework.getDefaultContextLoggerClass();
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {}

  public getFrameworkName() {
    return 'midway:serverless:app';
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }
  public getApplication(): IServerlessApp {
    return this.app;
  }

  public getServer() {
    return this.server;
  }

  private getStarterName() {
    const starter = this.spec?.provider?.starterModule;
    if (starter) {
      return require.resolve(starter);
    }
    const platform = this.getPlatform();
    const starterModList = StarterMap[platform];
    if (!starterModList || !starterModList.length) {
      throw new Error(`Current provider '${platform}' not support(no starter)`);
    }
    for (const mod of starterModList) {
      try {
        return require.resolve(mod);
      } catch {
        // continue
      }
    }
    throw new Error(
      `Platform starter '${
        starterModList[starterModList.length - 1]
      }' not found`
    );
  }

  private getTriggerMap() {
    const trigger = this.spec?.provider?.triggerModule;
    if (trigger) {
      return require(trigger);
    }
    const platform = this.getPlatform();
    const triggerModList = TriggerMap[platform];
    if (!triggerModList || !triggerModList.length) {
      throw new Error(`Current provider '${platform}' not support(no trigger)`);
    }
    for (const mod of triggerModList) {
      try {
        return require(mod);
      } catch {
        // continue
      }
    }
    throw new Error(
      `Platform trigger '${
        triggerModList[triggerModList.length - 1]
      }' not found`
    );
  }

  private async getServerlessInstance<T>(cls: any): Promise<T> {
    // 如何传initializeContext
    const context: IMidwayContext = await new Promise(resolve => {
      this.runtime.asyncEvent(async ctx => {
        resolve((this.innerFramework as any).getContext(ctx));
      })({}, this.configurationOptions.initContext || {});
    });

    return context.requestContext.getAsync(cls);
  }

  private getPlatform() {
    const provider = this.spec?.provider?.name;
    if (provider) {
      if (provider === 'fc' || provider === 'aliyun') {
        return 'aliyun';
      } else if (provider === 'scf' || provider === 'tencent') {
        return 'tencent';
      }
    }
    return provider;
  }

  async initialize(options: Partial<IMidwayBootstrapOptions>) {
    process.env.MIDWAY_SERVER_ENV = process.env.MIDWAY_SERVER_ENV || 'local';
    this.bootstrapOptions = options;
    this.getFaaSSpec();
    this.app = express() as any;
    const { appDir, baseDir } = options;

    const faasModule = '@midwayjs/faas';
    const faasModulePath = findNpmModule(appDir, faasModule);
    if (!faasModulePath) {
      throw new Error(`Module '${faasModule}' not found`);
    }
    const starterName = this.getStarterName();
    const usageFaaSModule = this.getFaaSModule();

    let usageFaasModulePath = faasModulePath;
    if (usageFaaSModule !== faasModule) {
      usageFaasModulePath = findNpmModule(appDir, usageFaaSModule);
      if (!usageFaasModulePath) {
        throw new Error(`Module '${usageFaasModulePath}' not found`);
      }
    }

    // 分析项目结构
    const locator = new Locator(appDir);
    const midwayLocatorResult = await locator.run({});
    const triggerMap = this.getTriggerMap();

    const { Framework } = require(usageFaasModulePath);
    const startResult = await start2({
      appDir,
      baseDir: midwayLocatorResult.tsCodeRoot || baseDir,
      framework: Framework,
      starter: require(starterName),
      initializeContext: undefined,
    });
    this.innerFramework = startResult.framework;
    this.runtime = startResult.runtime;
    this.innerApp = startResult.framework.getApplication();
    const invoke = startResult.invoke;
    const httpFuncSpec = await startResult.getFunctionsFromDecorator();
    if (!this.spec.functions) {
      this.spec.functions = {};
    }
    Object.assign(this.spec.functions, httpFuncSpec);
    this.app.getServerlessInstance = this.getServerlessInstance.bind(this);
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use((req, res, next) => {
      const gateway = createExpressGateway({
        functionDir: appDir,
      });
      gateway.transform(req, res, next, async () => {
        return {
          functionList: this.spec.functions,
          invoke: async args => {
            const trigger = [new triggerMap.http(...args.data)];
            let newArgs = trigger;
            let callBackTrigger;
            if (newArgs?.[0] && typeof newArgs[0].toArgs === 'function') {
              callBackTrigger = trigger[0];
              newArgs = await trigger[0].toArgs();
            }
            const result = await new Promise((resolve, reject) => {
              if (callBackTrigger?.useCallback) {
                // 这个地方 callback 得调用 resolve
                const cb = callBackTrigger.createCallback((err, result) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(result);
                });
                newArgs.push(cb);
              }
              Promise.resolve(invoke(args.functionHandler, newArgs)).then(
                resolve,
                reject
              );
            });
            if (callBackTrigger?.close) {
              await callBackTrigger.close();
            }
            return result;
          },
        };
      });
    });

    this.app.use((req, res) => {
      res.statusCode = 404;
      res.send(output404(req.path, this.spec.functions));
    });

    if (process.env.IN_CHILD_PROCESS) {
      this.listenMessage();
    }
  }

  protected getFaaSModule() {
    return process.env.DEV_MIDWAY_FAAS_MODULE || '@midwayjs/faas';
  }

  protected getFaasStarterName() {
    return 'FaaSStarter';
  }

  private getFaaSSpec() {
    const { appDir } = this.bootstrapOptions;
    const specFileInfo = getSpecFile(appDir);
    this.spec = loadSpec(appDir, specFileInfo);
  }

  public async run() {
    if (this.configurationOptions.port) {
      this.server = require('http').createServer(this.app);
      await new Promise<void>(resolve => {
        this.server.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }

  private listenMessage() {
    process.on('message', async msg => {
      if (!msg || !msg.type) {
        return;
      }
      const type = msg.type;
      let data;
      switch (type) {
        case 'functions':
          data = this.spec.functions;
          break;
      }
      process.send({ type: 'dev:' + type, data, id: msg.id });
    });
  }
}
