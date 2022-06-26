import { BaseRuntimeEngine } from './engine';
import {
  Bootstrap,
  Runtime,
  RuntimeEngine,
  BootstrapOptions,
} from './interface';

export class BaseBootstrap implements Bootstrap {
  runtimeEngine: RuntimeEngine;
  options: BootstrapOptions;
  runtime: Runtime;
  layers;

  constructor(options: BootstrapOptions = {}) {
    this.options = options;
    this.runtime = this.options.runtime;
    this.runtimeEngine = new BaseRuntimeEngine();
    this.runtimeEngine.add(engine => {
      engine.addBaseRuntime(options.runtime);
    });
    // set options
    if (this.runtime) {
      this.runtime.setOptions(this.options);
    }
  }

  public async start(): Promise<Runtime> {
    if (this.options.layers && this.options.layers.length) {
      this.options.layers.map(mod => this.runtimeEngine.add(mod));
    }
    await this.runtimeEngine.ready();
    return this.runtimeEngine.getCurrentRuntime() as Runtime;
  }

  public async close(): Promise<void> {
    await this.runtimeEngine.close();
  }

  public getRuntime(): Runtime {
    return this.runtimeEngine.getCurrentRuntime();
  }

  public getRuntimeEngine(): RuntimeEngine {
    return this.runtimeEngine;
  }
}
