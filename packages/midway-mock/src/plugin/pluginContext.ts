import {loading} from '..';
import {ApplicationContext} from '@ali/midway-context';
import {Plugin} from './Plugin';
import {PluginContainer} from './PluginContainer';
import {SharedContext} from '../SharedContext';

const path = require('path');

// 1、load plugin list in node_modules
// 2、create plugin instance use for-loop
//   3、create plugin context configuration and add dep
// 4、use IoC to load app.js/agent.js
// 5、in scene context and load scene features(koa middleware, controllers, router...)
//
// const container = new Container();
// container.addConfiguration({
//
// });
//
//
// const {Container} = require('midway');
// const container = new Container();
// // auto load xml config in app.js ?
//
// const webScene = container.getScene('web');
// webScene.port = 6001;
// await container.ready();

export interface PluginContextArgs {
  dirs?: string[];
  isAgent?: boolean;
}

export class PluginContext extends ApplicationContext {

  options: PluginContextArgs = {
    dirs: [],
    isAgent: false,
  };

  env = 'prod';
  appName;
  config: object;
  coreLogger: any = console;
  container: PluginContainer;
  enabledPlugins = [];

  constructor(baseDir) {
    super(baseDir, []);
    this.options = Object.assign(this.options, options);
    this.container = new PluginContainer();

    // set container value to compatible with egg plugin
    this.container.env = this.options.env;
    this.container.coreLogger = this.options.coreLogger;
    this.container.name = this.options.appName;
  }

  async loadDefinitions(configLocations: string[]): Promise<void> {
    const pluginList: Plugin[] = this.findPluginPkg();
    for (let plugin of pluginList) {
      this.registry.registerDefinition(plugin.name, plugin.getDefinition());
    }
  }

  findPluginPkg() {
    return loading(['*/package.json', '@ali/*/package.json'], {
      loadDirs: [this.baseDir].concat(this.options.dirs),
      call: false,
      resultHandler: (result, file) => {
        const pluginInfo = result['aliPlugin'] || result['eggPlugin'] || result['midwayPlugin'];
        if (pluginInfo) {
          return new Plugin({
            baseDir: path.dirname(file),
            dependencies: pluginInfo['dep'],
            optionalDependencies: pluginInfo['optionalDependencies'],
            name: pluginInfo.name,
            logger: this.options.coreLogger,
            pluginContainer: this.container,
            isAgent: this.options.isAgent,
            env: this.options.env,
            antx: {}
          });
        }
      },
    });
  }

  async initAll() {
    await new Promise((resolve, reject) => {
      for (let p of this.options.enabledPlugins) {
        // init first
        this.get(p);
      }

      let h = setInterval(() => {
        if (this.container.isError) {
          clearInterval(h);
          reject(this.container.lastError);
        } else if (this.container.isAllPluginReady) {
          clearInterval(h);
          resolve(true);
        }
      }, 10);
    });
  }
}
