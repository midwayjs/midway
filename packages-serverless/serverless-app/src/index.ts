import {
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
} from '@midwayjs/core';

import { Server } from 'net';
import { readFileSync } from 'fs';
import { join } from 'path';
import { start1, start2 } from './start';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { getSpecFile, loadSpec } from '@midwayjs/serverless-spec-builder';
import { createExpressGateway } from '@midwayjs/gateway-common-http';
import { findNpmModule, output404 } from './utils';
import { Locator } from '@midwayjs/locate';
import { StarterMap, TriggerMap } from './platform';

export class Framework extends BaseFramework<any, any, any> {
  private server: Server;
  private bootstrapOptions;
  private spec;
  async applicationInitialize(options: IMidwayBootstrapOptions) {}

  public getFrameworkName() {
    return 'midway:serverless:app';
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }
  public getApplication() {
    return this.app;
  }

  getStarterName() {
    const starter = this.spec?.provider?.starterModule;
    if (starter) {
      return require.resolve(starter);
    }
    const platform = this.getPlatform();
    const starterModList = StarterMap[platform];
    if (!starterModList || !starterModList.length) {
      throw new Error(`Current provider '${platform}' not support(no starter)`);
    }
    for(const mod of starterModList) {
      try {
        const starter = require.resolve(mod);
        return starter
      } catch {
        // continue
      }
    }
    throw new Error(`Platform starter '${starterModList[starterModList.length - 1]}' not found`);
  }

  getTriggerMap() {
    const trigger = this.spec?.provider?.triggerModule;
    if (trigger) {
      return require(trigger);
    }
    const platform = this.getPlatform();
    const triggerModList = TriggerMap[platform];
    if (!triggerModList || !triggerModList.length) {
      throw new Error(`Current provider '${platform}' not support(no trigger)`);
    }
    for(const mod of triggerModList) {
      try {
        const trigger = require(mod);
        return trigger
      } catch {
        // continue
      }
    }
    throw new Error(`Platform trigger '${triggerModList[triggerModList.length - 1]}' not found`);
  }

  getPlatform() {
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
    this.app = express();
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

    // 获取midwayjs/faas 的版本，不同版本使用不同的启动方式
    let version = process.env.DEV_MIDWAY_FAAS_VERSION;
    if (!version) {
      const pkgJson = JSON.parse(
        readFileSync(join(faasModulePath, 'package.json')).toString()
      );
      version = pkgJson.version;
    }
    let startResult;
    if (version[0] === '2') {
      const { Framework } = require(usageFaasModulePath);
      startResult = await start2({
        appDir,
        baseDir: midwayLocatorResult.tsCodeRoot || baseDir,
        framework: Framework,
        starter: require(starterName),
        initializeContext: undefined,
      });
    } else if (version[0] === '1') {
      const faasModule = require(usageFaasModulePath);
      const FaaSStarterName = this.getFaasStarterName();
      startResult = await start1({
        appDir,
        baseDir: appDir,
        tsCoodRoot: midwayLocatorResult.tsCodeRoot,
        faasModule: faasModule[FaaSStarterName],
        starter: require(starterName),
        initializeContext: undefined,
      });
    }

    if (!startResult) {
      throw new Error('This Project not support');
    }

    const invoke = startResult.invoke;
    const decorator = await startResult.getFunctionsFromDecorator();
    console.log('decorator info', decorator);
    this.app.invoke = invoke;
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

    this.listenMessage();
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
