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
import performance from './lib/performance';

export class BaseRuntimeEngine implements RuntimeEngine {
  public runtimeExtensions: RuntimeExtension[] = [];
  public contextExtensions: ContextExtensionHandler[] = [];
  public eventExtensions: EventExtensionHandler[] = [];
  public healthExtensions: HealthExtensionHandler[] = [];
  public runtime: Runtime;
  public baseRuntime;

  public add(extensionHandler: (engine: RuntimeEngine) => void) {
    extensionHandler(this);
  }

  public addBaseRuntime(baseRuntime: Runtime) {
    this.baseRuntime = baseRuntime;
  }

  public addRuntimeExtension(ext: RuntimeExtension): RuntimeEngine {
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

  public addHealthExtension(
    healthExtensionHandler: HealthExtensionHandler
  ): RuntimeEngine {
    this.healthExtensions.push(healthExtensionHandler);
    return this;
  }

  public addEventExtension(
    eventExtensionHandler: EventExtensionHandler
  ): RuntimeEngine {
    this.eventExtensions.push(eventExtensionHandler);
    return this;
  }

  public addContextExtension(
    contextExtensionHandler: ContextExtensionHandler
  ): RuntimeEngine {
    this.contextExtensions.push(contextExtensionHandler);
    return this;
  }

  public async ready(): Promise<void> {
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

  public async close(): Promise<void> {
    await this.runtime.close();
  }

  public getCurrentRuntime(): Runtime {
    return this.runtime;
  }

  private measureMarksOnReady() {
    [
      'runtimeStart',
      'beforeRuntimeStartHandler',
      'afterRuntimeStartHandler',
      'functionStart',
      'beforeFunctionStartHandler',
      'afterFunctionStartHandler',
    ].forEach(it => {
      performance.measure(
        `midway-faas:${it}:measure`,
        `midway-faas:${it}:start`,
        `midway-faas:${it}:end`
      );
    });
    // Disable midway performance marks.
    performance.disable();
  }
}
