import * as path from 'path';
import { MidwayContainer } from './context/midwayContainer';
import {
  CONFIGURATION_KEY,
  getProviderUUId,
  listModule,
} from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from './interface';
import { MidwayInformationService } from './service/informationService';

function buildLoadDir(baseDir, dir) {
  if (!path.isAbsolute(dir)) {
    return path.join(baseDir, dir);
  }
  return dir;
}

/**
 * @deprecated
 */
export class ContainerLoader {
  baseDir;
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
    this.applicationContext = new MidwayContainer(this.baseDir, undefined);
    this.applicationContext.setInformationService(
      new MidwayInformationService({
        baseDir: this.baseDir,
      })
    );
    this.applicationContext.disableConflictCheck = this.disableConflictCheck;
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
  }

  getApplicationContext(): IMidwayContainer {
    return this.applicationContext;
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

    if (loadOpts.disableAutoLoad) return;

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

    if (this.preloadModules && this.preloadModules.length) {
      for (const preloadModule of this.preloadModules) {
        this.applicationContext.bindClass(preloadModule);
      }
    }
  }

  async refresh() {
    await this.applicationContext.ready();
    await this.applicationContext.getAspectService().loadAspect();
    await this.loadLifeCycles();
  }

  async stop() {
    await this.applicationContext.stop();
  }

  async loadLifeCycles() {
    // agent 不加载生命周期
    const cycles: Array<{ target: any; namespace: string }> =
      listModule(CONFIGURATION_KEY);
    for (const cycle of cycles) {
      const providerId = getProviderUUId(cycle.target);
      const inst = await this.getApplicationContext().getAsync<ILifeCycle>(
        providerId
      );
      if (typeof inst.onReady === 'function') {
        await inst.onReady(this.getApplicationContext());
      }
    }
  }
}
