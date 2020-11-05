import {
  ContextExtensionHandler,
  EventExtensionHandler,
  HealthExtensionHandler,
  Runtime,
  RuntimeEngine,
  RuntimeExtension,
} from './interface';
import { ServerlessBaseRuntime } from './runtime';
import { completeAssign } from './util';
import { performance } from 'perf_hooks';

export class BaseRuntimeEngine implements RuntimeEngine {
  runtimeExtensions = [];
  contextExtensions = [];
  eventExtensions = [];
  healthExtensions = [];
  runtime: Runtime;
  baseRuntime;

  add(extensionHandler: (rt: RuntimeEngine) => void) {
    extensionHandler(this);
  }

  addBaseRuntime(baseRuntime: Runtime) {
    this.baseRuntime = baseRuntime;
  }

  addRuntimeExtension(ext: RuntimeExtension) {
    //
    // This is for compatibility legacy layers
    // And this logic will be removed soon
    //
    const legacyExt: any = ext;
    if (legacyExt.beforeStart) {
      ext.beforeRuntimeStart = legacyExt.beforeStart;
    }
    if (legacyExt.beforeReady) {
      ext.afterFunctionStart = legacyExt.beforeReady;
    }
    this.runtimeExtensions.push(ext);
    return this;
  }

  addHealthExtension(healthExtensionHandler: HealthExtensionHandler) {
    this.healthExtensions.push(healthExtensionHandler);
    return this;
  }

  addEventExtension(eventExtensionHandler: EventExtensionHandler) {
    this.eventExtensions.push(eventExtensionHandler);
    return this;
  }

  addContextExtension(contextExtensionHandler: ContextExtensionHandler) {
    this.contextExtensions.push(contextExtensionHandler);
    return this;
  }

  async ready() {
    if (!this.baseRuntime) {
      this.addBaseRuntime(new ServerlessBaseRuntime());
    }
    this.runtime = completeAssign.apply(
      this,
      [this.baseRuntime].concat(this.runtimeExtensions)
    );
    await this.getCurrentRuntime().init(this.contextExtensions);
    performance.mark('midway-faas:runtimeStart:start');
    await this.getCurrentRuntime().runtimeStart(this.eventExtensions);
    performance.mark('midway-faas:runtimeStart:end');
    performance.mark('midway-faas:functionStart:start');
    await this.getCurrentRuntime().functionStart();
    performance.mark('midway-faas:functionStart:end');
    this.measureMarksOnReady();
  }

  async close() {
    await this.runtime.close();
  }

  getCurrentRuntime() {
    return this.runtime;
  }

  private measureMarksOnReady() {
    [
      'runtimeStart',
      'functionStart',
      'beforeRuntimeStartHandler',
      'afterRuntimeStartHandler',
      'beforeFunctionStartHandler',
      'afterFunctionStartHandler',
    ].forEach(it => {
      performance.measure(
        `midway-faas:${it}:measure`,
        `midway-faas:${it}:start`,
        `midway-faas:${it}:end`
      );
    });
  }
}
