import {
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayContext,
  IMidwayFramework,
  MidwayFrameworkType,
} from '@midwayjs/core';
import { Application, IServerlessAppOptions } from './interface';
import { Server } from 'net';
import { StarterMap, TriggerMap } from './platform';
import * as express from 'express';
import { findNpmModule, output404 } from './utils';
import { start2 } from './start';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as bodyParser from 'body-parser';
import {
  getSpecFile,
  loadSpec,
  parse,
} from '@midwayjs/serverless-spec-builder';
import { createExpressGateway } from '@midwayjs/gateway-common-http';

export class Framework
  implements IMidwayFramework<Application, IServerlessAppOptions>
{
  app: Application;
  configurationOptions: IServerlessAppOptions;
  private innerApp: IMidwayApplication;
  private innerFramework: IMidwayFramework<any, any>;
  private innerBootStarter;
  private runtime: any;
  private server: Server;
  private bootstrapOptions;
  private spec;
  private proxyApp;
  configure(options: IServerlessAppOptions) {
    this.configurationOptions = options;
    return this;
  }
  async stop() {
    if (this.server?.close) {
      this.server.close();
    }
    if (this.innerBootStarter) {
      await this.innerBootStarter.stop();
    }
    if (this.runtime) {
      await this.runtime.close();
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
    return MidwayFrameworkType.SERVERLESS_APP;
  }
  public getApplication() {
    if (!this.proxyApp) {
      this.proxyApp = new Proxy(this.app, {
        get: (target, key) => {
          if (target[key]) {
            return target[key];
          }
          if (this[key]) {
            return this[key];
          }
        },
      });
    }
    return this.proxyApp;
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

  async getServerlessInstance<T>(cls: any): Promise<T> {
    // 如何传initializeContext
    const context: IMidwayContext = await new Promise(resolve => {
      this.runtime.asyncEvent(async ctx => {
        resolve((this.innerFramework as any).getContext(ctx));
      })({}, this.configurationOptions.initContext ?? {});
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
    this.bootstrapOptions = options;
    this.getFaaSSpec();
    this.app = express() as any;
    const { appDir, baseDir } = options;

    const faasModule = '@midwayjs/faas';
    const faasModulePath = process.env.MIDWAY_FAAS_PATH ?? findNpmModule(appDir, faasModule);
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
    const currentBaseDir = baseDir;
    const platform = this.getPlatform();

    const triggerMap = this.getTriggerMap();
    const layers = this.getLayers();
    const { Framework } = require(usageFaasModulePath);
    const startResult = await start2({
      appDir,
      baseDir: currentBaseDir,
      framework: Framework,
      layers: layers,
      starter: require(starterName),
      initializeContext: this.configurationOptions?.initContext,
    });
    this.innerFramework = startResult.framework;
    this.innerBootStarter = startResult.innerBootStarter;
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
      // for ali fc
      if (platform === 'aliyun') {
        if (!this.spec.experimentalFeatures?.forceFCCORS) {
          const origin = req.get('origin');
          if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            if (req.method.toLowerCase() === 'options') {
              res.send('');
              return;
            }
          }
        }
      }
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

    const syamlPath = resolve(appDir, 's.yaml');
    if (existsSync(syamlPath)) {
      const file = parse(syamlPath, readFileSync(syamlPath).toString());
      if (file?.services) {
        const allApps = Object.keys(file.services);
        if (allApps.length) {
          this.spec = file.services[allApps[0]].props;
        }
      }
    } else {
      const specFileInfo = getSpecFile(appDir);
      this.spec = loadSpec(appDir, specFileInfo);
    }
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

  protected getLayers() {
    const specLayers = [];
    if (this.spec?.layers) {
      Object.keys(this.spec.layers).forEach(layerName => {
        const info = this.spec.layers[layerName];
        if (!info?.path) {
          return;
        }
        const [type, path] = info.path.split(':');
        if (type === 'npm') {
          const layer = require(path);
          specLayers.push(layer);
        }
      });
    }
    return specLayers;
  }
}
