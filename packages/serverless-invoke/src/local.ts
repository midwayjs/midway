import { join } from 'path';
import { IFaaSStarter } from './interface';
import { FaaSStarterClass, Debug_Tag } from './utils';
import { createRuntime } from '@midwayjs/runtime-mock';
import { faasDebug } from './debug';
import { loadSpec } from '@midwayjs/fcli-command-core';

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
  handler;
  choseEvent: string;
  logger;
  yml: any;
  extensions: any;
  layers: any;

  constructor(opts: {
    baseDir?: string;
    typescript?: boolean;
    functionName: string;
    logger?;
    starter?: string;
    event?: {
      path: string;
      name: string;
    };
    handler?: string;
    layers?: any;
    runtime?: string;
  }) {
    this.opts = opts;
    this.baseDir = opts.baseDir = opts.baseDir || process.cwd();
    this.functionName = opts.functionName;
    this.logger = opts.logger || console;
    this.handler = this.opts.handler;
    this.layers = this.opts.layers;
  }

  async ready() {
    if (!this.isReady) {
      this.prepare();
      const preloadModules = [];
      this.starter = new FaaSStarterClass(
        Object.assign(
          {
            preloadModules,
          },
          this.opts
        )
      );
      await this.starter.start();
      this.isReady = true;
    }
  }

  prepare() {
    if (!this.handler || !this.layers) {
      this.getSpecInfo(this.functionName);
    }

    this.extensions = [];
    if (this.layers) {
      Object.keys(this.layers).forEach(extName => {
        const extInfo = this.layers[extName];
        if (!extInfo || !extInfo.path) {
          return;
        }
        let extPath = '';
        if (extensionsReg.npm.test(extInfo.path)) {
          extPath = extensionsReg.npm.exec(extInfo.path)[1];
        } else if (extensionsReg.local.test(extInfo.path)) {
          extPath = join(
            this.baseDir,
            extensionsReg.local.exec(extInfo.path)[1]
          );
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

    let handler = null;
    let othRuntime = null;
    if (this.opts.starter) {
      try {
        const starter = require(this.opts.starter);
        handler = starter.asyncWrapper(async (...args) => {
          const innerRuntime = await starter.start({});
          return innerRuntime.asyncEvent(innerFun)(...args);
        });
      } catch (e) {}
    }

    if (this.opts.runtime) {
      try {
        const runtimeClass = require(this.opts.runtime);
        othRuntime = new runtimeClass();
      } catch (e) {}
    }

    if (handler || othRuntime) {
      runtime = createRuntime({
        handler,
        runtime: othRuntime,
        layers: this.extensions || [],
      });
    }
    if (this.opts.event) {
      try {
        const EventModule = require(this.opts.event.path);
        const EventClass = EventModule[this.opts.event.name];
        trigger = [new EventClass(...args)];
      } catch (E) {}
    }

    if (!runtime) {
      console.warn(`runtime is not supported, use default invoke`);
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

  private getSpecInfo(functionName: string) {
    const specResult = loadSpec(this.baseDir);
    const layersList = [{}, specResult.layers || {}];
    let handler;
    if (
      specResult &&
      specResult.functions &&
      specResult.functions[functionName]
    ) {
      const funData = specResult.functions[functionName];
      handler = funData.handler;
      if (funData.runtimeExtensions) {
        layersList.push(funData.layers);
      }
    }

    this.handler = handler;
    this.layers = Object.assign.apply({}, layersList);
  }
}
