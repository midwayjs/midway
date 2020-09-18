import * as path from 'path';
import { MidwayContainer } from './context/midwayContainer';
import { Container } from './context/container';
import {
  ASPECT_KEY,
  AspectMetadata,
  getClassMetadata,
  IAspect,
  listModule,
  listPreloadModule,
} from '@midwayjs/decorator';
import { isAsyncFunction } from './util';
import * as pm from 'picomatch';

function buildLoadDir(baseDir, dir) {
  if (!path.isAbsolute(dir)) {
    return path.join(baseDir, dir);
  }
  return dir;
}

export class ContainerLoader {
  baseDir;
  pluginContext;
  applicationContext: MidwayContainer;
  isTsMode;
  preloadModules;
  disableConflictCheck: boolean;

  constructor({
    baseDir,
    isTsMode = true,
    preloadModules = [],
    disableConflictCheck = true,
  }) {
    this.baseDir = baseDir;
    this.isTsMode = isTsMode;
    this.preloadModules = preloadModules;
    this.disableConflictCheck = disableConflictCheck;
  }

  initialize() {
    this.pluginContext = new Container(this.baseDir);
    this.applicationContext = new MidwayContainer(this.baseDir, undefined);
    this.applicationContext.disableConflictCheck = this.disableConflictCheck;
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
  }

  getApplicationContext() {
    return this.applicationContext;
  }

  /**
   * @Deprecated
   */
  getPluginContext() {
    return this.pluginContext;
  }

  registerHook(hookKey, hookHandler) {
    this.applicationContext.registerDataHandler(hookKey, hookHandler);
  }

  loadDirectory(
    loadOpts: {
      baseDir?: string;
      loadDir?: string[];
      disableAutoLoad?: boolean;
      pattern?: string | string[];
      ignore?: string | string[];
    } = {}
  ) {
    if (!this.isTsMode && loadOpts.disableAutoLoad === undefined) {
      // disable auto load in js mode by default
      loadOpts.disableAutoLoad = true;
    }

    // if not disable auto load
    if (!loadOpts.disableAutoLoad) {
      // use baseDir in parameter first
      const baseDir = loadOpts.baseDir || this.baseDir;
      const defaultLoadDir = this.isTsMode ? [baseDir] : [];
      this.applicationContext.load({
        loadDir: (loadOpts.loadDir || defaultLoadDir).map(dir => {
          return buildLoadDir(baseDir, dir);
        }),
        pattern: loadOpts.pattern,
        ignore: loadOpts.ignore,
      });
    }

    if (this.preloadModules && this.preloadModules.length) {
      for (const preloadModule of this.preloadModules) {
        this.applicationContext.bindClass(preloadModule);
      }
    }
  }

  async refresh() {
    await this.pluginContext.ready();
    await this.applicationContext.ready();

    // some common decorator implementation
    const modules = listPreloadModule();
    for (const module of modules) {
      // preload init context
      await this.getApplicationContext().getAsync(module);
    }

    // for aop implementation
    const aspectModules = listModule(ASPECT_KEY);
    for (const module of aspectModules) {
      const data: AspectMetadata[] = getClassMetadata(ASPECT_KEY, module);
      for (const d of data) {
        await this.registerAspectToTarget(d, module);
      }
    }
  }

  private async registerAspectToTarget(aspectData, module) {
    for (const aspectTarget of aspectData.aspectTarget) {
      const names = Object.getOwnPropertyNames(module.prototype);
      const aspectIns = await this.getApplicationContext().getAsync<IAspect>(
        aspectTarget
      );
      const isMatch = aspectData.match ? pm(aspectData.match) : () => true;

      for (const name of names) {
        if (name === 'constructor' || !isMatch(name)) {
          continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(
          module.prototype,
          name
        );
        if (!descriptor || descriptor.writable === false) {
          continue;
        }
        const originMethod = descriptor.value;
        if (isAsyncFunction(originMethod)) {
          descriptor.value = async function (...args) {
            let error, result;
            const joinPoint = {
              methodName: name,
              target: this,
              args: args,
              proceed: originMethod,
            };
            try {
              await aspectIns.before?.(joinPoint);
              if (aspectIns.around) {
                result = await aspectIns.around(joinPoint);
              } else {
                result = await originMethod.apply(this, joinPoint.args);
              }
              const resultTemp = await aspectIns.afterReturn?.(
                joinPoint,
                result
              );
              result = typeof resultTemp === 'undefined' ? result : resultTemp;
              return result;
            } catch (err) {
              error = err;
              if (aspectIns.afterThrow) {
                try {
                  await aspectIns.afterThrow(joinPoint, error);
                } catch (newErr) {
                  error = newErr;
                  throw newErr;
                }
              } else {
                throw err;
              }
            } finally {
              await aspectIns.after?.(joinPoint, result, error);
            }
          };
        } else {
          descriptor.value = function (...args) {
            let error, result;
            const joinPoint = {
              methodName: name,
              target: this,
              args: args,
              proceed: originMethod,
            };
            try {
              aspectIns.before?.(joinPoint);
              if (aspectIns.around) {
                result = aspectIns.around(joinPoint);
              } else {
                result = originMethod.apply(this, joinPoint.args);
              }
              const resultTemp = aspectIns.afterReturn?.(joinPoint, result);
              result = typeof resultTemp === 'undefined' ? result : resultTemp;
              return result;
            } catch (err) {
              error = err;
              if (aspectIns.afterThrow) {
                try {
                  aspectIns.afterThrow(joinPoint, error);
                } catch (newErr) {
                  error = newErr;
                  throw newErr;
                }
              } else {
                throw err;
              }
            } finally {
              aspectIns.after?.(joinPoint, result, error);
            }
          };
        }

        Object.defineProperty(module.prototype, name, descriptor);
      }
    }
  }

  async stop() {
    await this.pluginContext.stop();
    await this.applicationContext.stop();
  }
}
