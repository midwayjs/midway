import { transform } from '@midwayjs/spec-builder';
import { join } from 'path';
import { existsSync } from 'fs';
import { IFaaSStarter } from './interface';
import { FaaSStarterClass, Debug_Tag } from './utils';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FcStarter from '@midwayjs/serverless-fc-starter';
import * as ScfStarter from '@midwayjs/serverless-scf-starter';

import { ApiGatewayTrigger, HTTPTrigger } from '@midwayjs/serverless-fc-trigger';
import { faasDebug } from './debug';

const extensionsReg = {
  npm: /npm:\s*(.*?)\s*$/i,
  local: /local:\s*(.*?)\s*$/i,
};

export class Local {

  ctx = {};
  opts;
  baseDir: string;
  starter: IFaaSStarter;
  functionName: string;
  isReady: boolean;
  isContextReady: boolean;
  eventType: string[];
  handler;
  choseEvent: string;
  logger;
  runtime: string;
  trigger: string;
  yml: any;
  extensions: any;

  constructor(opts: {
    baseDir?: string;
    typescript?: boolean;
    functionName: string;
    logger?;
    trigger?: string
  }) {
    this.opts = opts;
    this.baseDir = opts.baseDir = opts.baseDir || process.cwd();
    this.functionName = opts.functionName;
    this.logger = opts.logger || console;
    this.trigger = opts.trigger || '';
  }

  async ready() {
    if (!this.isReady) {
      this.prepare();
      const preloadModules = [];
      this.starter = new FaaSStarterClass(Object.assign({
        preloadModules
      }, this.opts));
      await this.starter.start();
      this.isReady = true;
    }
  }

  prepare() {
    if (!existsSync(join(this.baseDir, 'serverless.yml'))) {
      console.log('this.baseDir', this.baseDir);
      throw new Error(`We can\'t found serverless.yml in current dir`);
    }

    this.yml = this.getSpecInfo(this.functionName);
    this.eventType = this.yml.eventResult;
    this.handler = this.yml.handler;
    this.runtime = this.yml.spec.provider.name;
    this.extensions = [];
    if (this.yml.layers) {
      Object.keys(this.yml.layers).forEach(extName => {
        const extInfo = this.yml.layers[extName];
        if (!extInfo || !extInfo.path) {
          return;
        }
        let extPath = '';
        if (extensionsReg.npm.test(extInfo.path)) {
          extPath = extensionsReg.npm.exec(extInfo.path)[1];
        } else if (extensionsReg.local.test(extInfo.path)) {
          extPath = join(this.baseDir, extensionsReg.local.exec(extInfo.path)[1]);
        }
        if (extPath) {
          try {
            const ext = require(extPath);
            this.extensions.push(ext);
          } catch (e) {
            console.log(`layer ${extName} load error`, e.message);
          }
        }
      });
    }

    if (!this.handler) {
      throw new Error(`We can\'t found handler info in yml`);
    }

    if (this.trigger) {
      if (Array.isArray(this.eventType) && !this.eventType.includes(this.trigger)) {
        throw new Error(`trigger ${this.trigger} is not configured in serverless.yml`);
      }
      this.logger.info(`trigger: ${this.trigger}`);
    } else {
      if (Array.isArray(this.eventType)) {
        this.trigger = this.eventType[ 0 ];
      }
    }
  }

  async invoke(...args) {

    await this.ready();
    this.createAnonymousContext();
    let isDebug = false;
    if (args && args[args.length - 1] === Debug_Tag) {
      isDebug = true;
      args.pop();
    }
    this.logger.info(`Serverless: invoke args = ${JSON.stringify(args)}`);
    const wrapFun = this.starter.handleInvokeWrapper(this.handler, isDebug);

    let runtime = null;
    let trigger = [];

    const innerFun = async (...args) => {
      if (isDebug) {
        const handler = await wrapFun(...args);
        return faasDebug(handler);
      }
      return wrapFun(...args);
    };

    if (this.runtime === 'aliyun') {
      runtime = createRuntime({
        handler: FcStarter.asyncWrapper(async (...args) => {
          const innerRuntime = await FcStarter.start({});
          return innerRuntime.asyncEvent(innerFun)(...args);
        }),
        layers: this.extensions || []
      });

      if (this.trigger === 'http') {
        const httpTrigger: any = new HTTPTrigger(args && args[0] || {});
        trigger = [httpTrigger];
      } else if (this.trigger === 'apiGateway') {
        trigger = [new ApiGatewayTrigger()];
      }
    } else if (this.runtime === 'tencent') {
      runtime = createRuntime({
        handler: ScfStarter.asyncWrapper(async (...args) => {
          const innerRuntime = await ScfStarter.start({});
          return innerRuntime.asyncEvent(innerFun)(...args);
        }),
        layers: this.extensions || []
      });
    } else {
      console.warn(`runtime ${this.runtime} is not supported, use default invoke`);
      return innerFun(...args);
    }

    await runtime.start();
    const result = await runtime.invoke(...trigger);
    await runtime.close();
    return result;
  }

  private createAnonymousContext() {
    if (!this.isContextReady) {
      this.isContextReady = true;
    }
  }

  private getSpecInfo(functionName: string): {
    eventResult: string[];
    handler: string;
    serviceList: string[];
    layers: any;
    spec: any;
  } {
    const specResult = transform(join(this.baseDir, 'serverless.yml'));
    let eventResult = [];
    const layersList = [{}, specResult.layers || {}];
    let handler;
    let serviceList: string [];
    if (specResult && specResult.functions && specResult.functions[functionName]) {
      const funData = specResult.functions[functionName];
      const events = funData.events;
      handler = funData.handler;
      if (funData.runtimeExtensions) {
        layersList.push(funData.layers);
      }
      if (Array.isArray(events)) {
        let eventKey = [];
        for (const evt of events) {
          eventKey = eventKey.concat(Object.keys(evt));
        }
        eventResult = eventKey;
      }

      if (specResult.resources && specResult.resources.services) {
        serviceList = specResult.resources.services.map((item) => {
          return typeof item === 'string' ? item : Object.keys(item)[ 0 ];
        });
      }
    }

    return {
      spec: specResult,
      eventResult,
      handler,
      serviceList,
      layers: Object.assign.apply({}, layersList)
    };
  }
}
