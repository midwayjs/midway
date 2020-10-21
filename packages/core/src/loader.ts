import * as path from 'path';
import { MidwayContainer } from './context/midwayContainer';
import { Container } from './context/container';
import {
  ASPECT_KEY,
  getClassMetadata,
  IMethodAspect,
  listModule,
  listPreloadModule,
} from '@midwayjs/decorator';
import { IMidwayContainer } from './interface';

import { debuglog } from 'util';
const debugLogger = debuglog('midway:loader');

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
  duplicatedLoader: boolean;

  static contextCache = new Map();
  static clearContextCache = () => {
    ContainerLoader.contextCache.clear();
  }

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
    this.duplicatedLoader = false;
  }

  initialize() {
    this.pluginContext = new Container(this.baseDir);
    if (ContainerLoader.contextCache.has(this.baseDir)) {
      // 标识为重复的加载器，只做简单的缓存读取，单进程同一目录只扫描一次
      this.duplicatedLoader = true;
      this.applicationContext = ContainerLoader.contextCache.get(this.baseDir);
    } else {
      this.applicationContext = new MidwayContainer(this.baseDir, undefined);
      this.applicationContext.disableConflictCheck = this.disableConflictCheck;
      this.applicationContext.registerObject('baseDir', this.baseDir);
      this.applicationContext.registerObject('isTsMode', this.isTsMode);
      ContainerLoader.contextCache.set(this.baseDir, this.applicationContext);
    }
  }

  getApplicationContext(): IMidwayContainer {
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
    if (this.duplicatedLoader) {
      debugLogger(`This is a duplicate loader and skip loadDirectory, baseDir=${this.baseDir}`);
      return;
    }
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
    if (this.duplicatedLoader) {
      debugLogger(`This is a duplicate loader and skip refresh, baseDir=${this.baseDir}`);
      return;
    }
    await this.applicationContext.ready();

    // some common decorator implementation
    const modules = listPreloadModule();
    for (const module of modules) {
      // preload init context
      await this.getApplicationContext().getAsync(module);
    }

    // for aop implementation
    const aspectModules = listModule(ASPECT_KEY);
    // sort for aspect target
    let aspectDataList = [];
    for (const module of aspectModules) {
      const data = getClassMetadata(ASPECT_KEY, module);
      aspectDataList = aspectDataList.concat(
        data.map(el => {
          el.aspectModule = module;
          return el;
        })
      );
    }

    // sort priority
    aspectDataList.sort((pre, next) => {
      return (next.priority || 0) - (pre.priority || 0);
    });

    for (const aspectData of aspectDataList) {
      const aspectIns = await this.getApplicationContext().getAsync<
        IMethodAspect
      >(aspectData.aspectModule);
      await this.getApplicationContext().addAspect(aspectIns, aspectData);
    }
  }

  async stop() {
    await this.pluginContext.stop();
    if (this.duplicatedLoader) {
      debugLogger(`This is a duplicate loader and skip stop, baseDir=${this.baseDir}`);
      return;
    }
    await this.applicationContext.stop();
  }

}
