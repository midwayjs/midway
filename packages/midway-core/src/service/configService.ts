import * as extend from 'extend2';
import * as is from 'is-type-of';
import { basename } from 'path';
import { IConfigService, IMidwayContainer } from '../interface';
import { safelyGet } from '../common/util';

const debug = require('debug')('midway:config');

export class MidwayConfigService implements IConfigService {

  envDirMap: Map<string, Set<string>>;
  configuration;
  isReady = false;
  container: IMidwayContainer;
  externalObject: object[] = [];

  constructor(container) {
    this.container = container;
    this.envDirMap = new Map();
  }

  add(configFilePaths: string[]) {
    for (const dir of configFilePaths) {
      const env = this.getConfigEnv(dir);
      const envSet = this.getEnvSet(env);
      envSet.add(dir);
    }
  }

  addObject(obj: object) {
    if (this.isReady) {
      extend(true, this.configuration, obj);
    } else {
      this.externalObject.push(obj);
    }
  }

  getEnvSet(env) {
    if (!this.envDirMap.has(env)) {
      this.envDirMap.set(env, new Set());
    }
    return this.envDirMap.get(env);
  }

  getConfigEnv(configFilePath) {
    // parse env
    const configFileBaseName = basename(configFilePath);
    const splits = configFileBaseName.split('.');
    const suffix = splits.pop();
    if (suffix !== 'js' && suffix !== 'ts') {
      return suffix;
    }
    return splits.pop();
  }

  async load() {
    // get default
    const defaultSet = this.getEnvSet('default');
    // get current set
    const currentEnvSet = this.getEnvSet(this.container.getCurrentEnv());
    // merge set
    const target = {};
    for (const filename of [...defaultSet, ...currentEnvSet]) {
      const config = await this.loadConfig(filename);

      if (!config) {
        continue;
      }

      debug('Loaded config %s, %j', filename, config);
      extend(true, target, config);
    }
    if (this.externalObject.length) {
      for (const externalObject of this.externalObject) {
        if (externalObject) {
          debug('Loaded external object %j', externalObject);
          extend(true, target, externalObject);
        }
      }
    }
    this.configuration = target;
    this.isReady = true;
  }

  getConfiguration(configKey) {
    if (configKey) {
      debug('get configuration by key => %s.', configKey);
      return safelyGet(configKey, this.configuration);
    }
    return this.configuration;
  }

  async loadConfig(configFilename): Promise<object> {
    debug('load config %s.', configFilename);
    let exports = require(configFilename);
    if (exports && exports['default'] && Object.keys(exports).length === 1) {
      exports = exports['default'];
    }
    let result = exports;
    if (is.function(exports)) {
      result = await exports.apply(null, [].concat(this.container));
    }
    return result;
  }
}
