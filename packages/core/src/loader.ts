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

  /**
   * 单个进程中上一次的 applicationContext
   */
  static parentApplicationContext: IMidwayContainer;

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
    // this.duplicatedLoader = false;
  }

  initialize() {
    this.pluginContext = new Container(this.baseDir);
    this.applicationContext = new MidwayContainer(
      this.baseDir,
      ContainerLoader.parentApplicationContext
    );
    this.applicationContext.disableConflictCheck = this.disableConflictCheck;
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
    // 保存到最新的上下文中，供其他容器获取
    ContainerLoader.parentApplicationContext = this.applicationContext;
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
    // if (this.duplicatedLoader) {
    //   debugLogger(
    //     `This is a duplicate loader and skip loadDirectory, baseDir=${this.baseDir}`
    //   );
    //   return;
    // }
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
    await this.applicationContext.stop();
  }
}
