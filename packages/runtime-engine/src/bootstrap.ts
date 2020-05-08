import { BaseRuntimeEngine } from './engine';
import {
  Bootstrap,
  Runtime,
  RuntimeEngine,
  BootstrapOptions,
} from './interface';

export class BaseBootstrap implements Bootstrap {
  runtimeEngine: RuntimeEngine;
  options;
  runtime;
  layers;

  constructor(options: BootstrapOptions = {}) {
    this.options = options;
    this.runtime = this.options.runtime;
    this.runtimeEngine = new BaseRuntimeEngine();
    this.runtimeEngine.add(engine => {
      engine.addBaseRuntime(options.runtime);
    });
  }

  async start() {
    if (this.options.layers && this.options.layers.length) {
      this.options.layers.map(mod => this.runtimeEngine.add(mod));
    }
    await this.runtimeEngine.ready();
    return this.runtimeEngine.getCurrentRuntime() as Runtime;
  }

  async close() {
    return this.runtimeEngine.close();
  }

  getRuntime() {
    return this.runtimeEngine.getCurrentRuntime();
  }

  getRuntimeEngine() {
    return this.runtimeEngine;
  }
}
