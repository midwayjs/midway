import {
  BaseFramework,
  IMidwayBootstrapOptions,
  IMidwayContext,
  MidwayCommonError,
  MidwayFrameworkType,
} from '@midwayjs/core';
import { Application, IServerlessAppOptions } from './interface';
import { Server } from 'net';
import { StarterMap, TriggerMap } from './platform';
import * as express from 'express';
import { output404 } from './utils';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import * as bodyParser from 'body-parser';
import {
  getSpecFile,
  loadSpec,
  parse,
} from '@midwayjs/serverless-spec-builder';
import { createExpressGateway } from '@midwayjs/gateway-common-http';
import { Framework as FaaSFramework, Context } from '@midwayjs/faas';
import { Inject, Framework } from '@midwayjs/decorator';
import { start3 } from './start';

@Framework()
export class ServerlessAppFramework extends BaseFramework<
  Application,
  Context,
  IServerlessAppOptions
> {
  @Inject()
  private innerServerlessFramework: FaaSFramework;
  configurationOptions: IServerlessAppOptions;

  private runtime: any;
  private server: Server;
  private spec;
  protected bootstrapOptions;
  protected invokeFun;
  private httpServerApp;
  private proxyApp;

  configure(options) {}

  async beforeStop() {
    if (this.server?.close) {
      this.server.close();
    }
    if (this.runtime) {
      await this.runtime.close();
    }
  }

  public getFrameworkName() {
    return 'midway:serverless:app';
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.SERVERLESS_APP;
  }
  public getApplication() {
    if (!this.proxyApp) {
      this.proxyApp = new Proxy(this.httpServerApp, {
        get: (target, key) => {
          if (key === 'callback') return;
          if (target[key]) {
            return target[key];
          }
          if (this.app[key]) {
            return this.app[key];
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
      throw new MidwayCommonError(
        `Current provider '${platform}' not support(no starter)`
      );
    }
    for (const mod of starterModList) {
      try {
        return require.resolve(mod);
      } catch {
        // continue
      }
    }
    throw new MidwayCommonError(
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
      throw new MidwayCommonError(
        `Current provider '${platform}' not support(no trigger)`
      );
    }
    for (const mod of triggerModList) {
      try {
        return require(mod);
      } catch {
        // continue
      }
    }
    throw new MidwayCommonError(
      `Platform trigger '${
        triggerModList[triggerModList.length - 1]
      }' not found`
    );
  }

  async getServerlessInstance<T>(cls: any): Promise<T> {
    // 如何传initializeContext
    const context: IMidwayContext = await new Promise(resolve => {
      this.runtime.asyncEvent(async ctx => {
        resolve((this.innerServerlessFramework as any).getContext(ctx));
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

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.configurationOptions = options as IServerlessAppOptions;
    this.bootstrapOptions = options;
    this.getFaaSSpec();
    this.httpServerApp = express() as any;

    const { appDir } = options;
    const starterName = this.getStarterName();

    // 分析项目结构
    const layers = this.getLayers();
    const startResult = await start3({
      appDir,
      framework: this.innerServerlessFramework,
      layers: layers,
      starter: require(starterName),
      initializeContext: this.configurationOptions?.initContext,
    });

    this.app = this.innerServerlessFramework.getApplication() as Application;
    this.runtime = startResult.runtime;
    this.invokeFun = startResult.invoke;
    const funcSpec = await startResult.getFunctionsFromDecorator();
    if (!this.spec.functions) {
      this.spec.functions = {};
    }
    Object.assign(this.spec.functions, funcSpec);
    this.app.getServerlessInstance = this.getServerlessInstance.bind(this);
    this.httpServerApp.use(
      bodyParser.urlencoded({
        extended: false,
        limit: this.configurationOptions.bodyParserLimit ?? '2mb',
      })
    );
    this.httpServerApp.use(
      bodyParser.json({
        limit: this.configurationOptions.bodyParserLimit ?? '2mb',
      })
    );
    this.httpServerApp.use(this.faasInvokeMiddleware.bind(this));
    this.httpServerApp.use((req, res) => {
      res.statusCode = 404;
      res.send(output404(req.path, this.spec.functions));
    });

    if (process.env.IN_CHILD_PROCESS) {
      this.listenMessage();
    }
  }

  protected async faasInvokeMiddleware(req, res, next) {
    const { appDir } = this.bootstrapOptions;
    const platform = this.getPlatform();
    const triggerMap = this.getTriggerMap();
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
            res.setHeader(
              'Access-Control-Allow-Methods',
              req.get('Access-Control-Request-Method') || '*'
            );
            res.setHeader(
              'Access-Control-Allow-Headers',
              req.get('Access-Control-Request-Headers') || '*'
            );
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
            Promise.resolve(this.invokeFun(args.functionHandler, newArgs)).then(
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
    // set port and listen server
    const customPort =
      process.env.MIDWAY_HTTP_PORT ?? this.configurationOptions.port;
    if (customPort) {
      if (this.configurationOptions.ssl) {
        this.server = require('https').createServer(
          {
            key: readFileSync(join(__dirname, '../ssl/ssl.key'), 'utf8'),
            cert: readFileSync(join(__dirname, '../ssl/ssl.pem'), 'utf8'),
          },
          this.httpServerApp
        );
      } else {
        this.server = require('http').createServer(this.httpServerApp);
      }

      await new Promise<void>(resolve => {
        this.server.listen(customPort, () => {
          resolve();
        });
      });
    }
  }

  private listenMessage() {
    process.on('message', async (msg: any) => {
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
