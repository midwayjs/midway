import {
  BaseBootstrap,
  FunctionEvent,
  getHandlerMeta,
  getHandlerMethod,
  Runtime,
} from '@midwayjs/runtime-engine';
import { BaseTrigger, Trigger } from './trigger';
import { join } from 'path';

export function sleep(sec = 1000) {
  return new Promise(done => setTimeout(done, sec));
}

export interface MockRuntimeOptions {
  layers?: any[];
  functionDir?: string;
  bootstrap?;
  events?: FunctionEvent[];
  handler?: any;
  initHandler?: any;
  initContext?: any;
  runtime?: Runtime;
}

export class MockRuntime {
  options;
  runtime: Runtime;
  layers;
  bootstrap;
  engine;
  handler;
  trigger: Trigger;
  initHandler;

  constructor(options: MockRuntimeOptions = {}) {
    this.options = options;
    this.handler = options.handler;
    if (this.options.bootstrap || this.options.runtime || this.options.events) {
      this.bootstrap = this.options.bootstrap
        ? new this.options.bootstrap()
        : new BaseBootstrap({
            runtime: this.options.runtime,
            layers: this.options.layers,
            runtimeConfig: this.options.runtimeConfig,
          });
      this.engine = this.bootstrap.getRuntimeEngine();
    }
  }

  async start() {
    process.env.ENTRY_DIR = this.options.functionDir;
    if (this.bootstrap) {
      // lightRuntime 需要调用自身逻辑
      if (this.options.events) {
        for (const event of this.options.events) {
          this.engine.addEventExtension(async (runtime: Runtime) => {
            return event;
          });
        }
      }

      await this.bootstrap.start();
      await sleep(500);
      this.runtime = this.bootstrap.getRuntime();
    }
    if (this.options.initHandler) {
      await this.options.initHandler(this.options.initContext);
    }
    return this.runtime;
  }

  async invoke(...args) {
    let newArgs;
    if (args[0] && args[0] instanceof BaseTrigger) {
      this.trigger = args[0];
      newArgs = await this.trigger.toArgs();
    } else {
      newArgs = args;
    }

    return this.invokeHandlerMethod(newArgs);
  }

  async delegate(trigger: Trigger) {
    this.trigger = trigger;
    // TODO 普通 runtime
    // 传入一个方法包裹，返回一个参数列表，然后执行方法
    return this.trigger.delegate(invokeArgs => {
      return this.invokeHandlerMethod(invokeArgs);
    });
  }

  private async invokeHandlerMethod(newArgs) {
    if (this.runtime) {
      return this.runtime.invoke(newArgs);
    } else {
      // for LightRuntime
      let handlerMethod: any;
      if (typeof this.handler === 'function') {
        handlerMethod = this.handler;
      } else {
        const { fileName, handler } = getHandlerMeta(
          this.handler || 'index.handler'
        );
        handlerMethod = getHandlerMethod(
          join(this.options.functionDir, fileName),
          handler
        );
      }

      return new Promise((resolve, reject) => {
        if (this.trigger && this.trigger.useCallback) {
          // 这个地方 callback 得调用 resolve
          const cb = this.trigger.createCallback((err, result) => {
            if (err) {
              // 异步返回
              reject(err);
            } else {
              resolve(result);
            }
          });
          newArgs.push(cb);
        }

        Promise.resolve(handlerMethod.apply(this, newArgs)).then(
          resolve,
          reject
        );
      });
    }
  }

  async close() {
    process.env.ENTRY_DIR = '';
    if (this.trigger) {
      await this.trigger.close();
    }
    if (this.bootstrap) {
      await this.bootstrap.close();
    }
    await sleep(500);
  }
}

export const createRuntime = (options?: MockRuntimeOptions) => {
  return new MockRuntime(options);
};
