import * as path from 'path';
import { MidwayContainer } from './container';

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

  constructor({baseDir, isTsMode = true, preloadModules = []}) {
    this.baseDir = baseDir;
    this.isTsMode = isTsMode;
    this.preloadModules = preloadModules;
  }

  initialize() {
    this.pluginContext = new MidwayContainer();
    this.applicationContext = new MidwayContainer(this.baseDir, undefined, this.isTsMode);
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
  }

  getApplicationContext() {
    return this.applicationContext;
  }

  getPluginContext() {
    return this.pluginContext;
  }

  registerHook(hookKey, hookHandler) {
    this.applicationContext.registerDataHandler(hookKey, hookHandler);
  }

  loadDirectory(loadOpts: {
    baseDir?: string;
    loadDir?: string[];
    disableAutoLoad?: boolean;
    pattern?: string;
    ignore?: string;
    configLocations?: string[];
  } = {}) {
    if (!this.isTsMode && loadOpts.disableAutoLoad === undefined) {
      // disable auto load in js mode by default
      loadOpts.disableAutoLoad = true;
    }

    // if not disable auto load
    if (!loadOpts.disableAutoLoad) {
      // use baseDir in parameter first
      const baseDir = loadOpts.baseDir || this.baseDir;
      const defaultLoadDir = this.isTsMode ? [baseDir] : ['app', 'lib'];
      this.applicationContext.load({
        loadDir: (loadOpts.loadDir || defaultLoadDir).map(dir => {
          return buildLoadDir(baseDir, dir);
        }),
        pattern: loadOpts.pattern,
        ignore: loadOpts.ignore
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
  }

}
