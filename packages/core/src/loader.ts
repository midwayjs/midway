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
import { getPrototypeNames } from "./util";

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

    // some common decorator implements
    const modules = listPreloadModule();
    for (const module of modules) {
      // preload init context
      await this.getApplicationContext().getAsync(module);
    }

    const aspectModules = listModule(ASPECT_KEY);
    for (const module of aspectModules) {
      const data: AspectMetadata = getClassMetadata(ASPECT_KEY, module);
      for (const aspectTarget of data.aspectTarget) {
        // eslint-disable-next-line no-undef
        const names = getPrototypeNames(module.prototype);
        const aspectIns = await this.getApplicationContext().getAsync<IAspect>(aspectTarget);
        if (data.match) {
          // TODO match
        }

        for (const name of names) {
          const descriptor = Object.getOwnPropertyDescriptor(module.prototype, name);
          const originMethod = descriptor.value;

          descriptor.value = async () => {
            return originMethod();
          }
        }

        console.log(names, aspectIns);
      }

    }
  }

  async stop() {
    await this.pluginContext.stop();
    await this.applicationContext.stop();
  }
}
