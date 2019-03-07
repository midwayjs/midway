import * as path from 'path';
import { MidwayContainer } from './container';
import { MidwayRequestContainer } from './requestContainer';

export class ContainerLoader {

  baseDir;
  pluginContext;
  applicationContext;
  requestContext;
  isTsMode;

  constructor({baseDir, isTsMode = true}) {
    this.baseDir = baseDir;
    this.isTsMode = isTsMode;
  }

  initialize() {
    this.pluginContext = new MidwayContainer();
    this.applicationContext = new MidwayContainer(this.baseDir);
    this.requestContext = new MidwayRequestContainer(this.applicationContext);
    // put requestContext to applicationContext
    this.applicationContext.registerObject('requestContext', this.requestContext);
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
  }

  getApplicationContext() {
    return this.applicationContext;
  }

  getPluginContext() {
    return this.pluginContext;
  }

  getRequestContext() {
    return this.requestContext;
  }

  registerAllHook(hookKey, hookHandler) {
    this.registerApplicationHook(hookKey, hookHandler);
    this.registerRequestHook(hookKey, hookHandler);
  }

  registerApplicationHook(hookKey, hookHandler) {
    this.applicationContext.registerDataHandler(hookKey, hookHandler);
  }

  registerRequestHook(hookKey, hookHandler) {
    this.requestContext.registerDataHandler(hookKey, hookHandler);
  }

  loadDirectory(loadOpts: {
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

    // 如果没有关闭autoLoad 则进行load
    if (!loadOpts.disableAutoLoad) {
      const defaultLoadDir = this.isTsMode ? [this.baseDir] : ['app', 'lib'];
      this.applicationContext.load({
        loadDir: (loadOpts.loadDir || defaultLoadDir).map(dir => {
          return this.buildLoadDir(dir);
        }),
        pattern: loadOpts.pattern,
        ignore: loadOpts.ignore
      });
    }
  }

  async refresh() {
    await this.pluginContext.ready();
    await this.applicationContext.ready();
    await this.requestContext.ready();
  }

  private buildLoadDir(dir) {
    if (!path.isAbsolute(dir)) {
      return path.join(this.baseDir, dir);
    }
    return dir;
  }

}
