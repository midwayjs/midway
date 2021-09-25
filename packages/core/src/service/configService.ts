import * as extend from 'extend2';
import { basename, join } from 'path';
import { IConfigService } from '../interface';
import { safelyGet } from '../util';
import { readdirSync, statSync } from 'fs';
import {
  Inject,
  isFunction,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as util from 'util';
import { MidwayEnvironmentService } from './environmentService';
import { MidwayInformationService } from './informationService';

const debug = util.debuglog('midway:config');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayConfigService implements IConfigService {
  private envDirMap: Map<string, Set<any>> = new Map();
  private aliasMap = {
    prod: 'production',
    unittest: 'test',
  };
  configuration;
  isReady = false;
  externalObject: Record<string, unknown>[] = [];

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Inject()
  informationService: MidwayInformationService;

  add(configFilePaths: any[]) {
    for (const dir of configFilePaths) {
      if (typeof dir === 'string') {
        if (/\.\w+$/.test(dir)) {
          // file
          const env = this.getConfigEnv(dir);
          const envSet = this.getEnvSet(env);
          envSet.add(dir);
          if (this.aliasMap[env]) {
            this.getEnvSet(this.aliasMap[env]).add(dir);
          }
        } else {
          // directory
          const fileStat = statSync(dir);
          if (fileStat.isDirectory()) {
            const files = readdirSync(dir);
            this.add(
              files.map(file => {
                return join(dir, file);
              })
            );
          }
        }
      } else {
        // object add
        for (const env in dir) {
          const envSet = this.getEnvSet(env);
          envSet.add(dir[env]);
        }
      }
    }
  }

  addObject(obj: Record<string, unknown>) {
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
    if (this.isReady) return;
    // get default
    const defaultSet = this.getEnvSet('default');
    // get current set
    const currentEnvSet = this.getEnvSet(
      this.environmentService.getCurrentEnvironment()
    );
    // merge set
    const target = {};
    for (const filename of [...defaultSet, ...currentEnvSet]) {
      let config = filename;
      if (typeof filename === 'string') {
        config = await this.loadConfig(filename, target);
      }

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

  getConfiguration(configKey?: string) {
    if (configKey) {
      debug('get configuration by key => %s.', configKey);
      return safelyGet(configKey, this.configuration);
    }
    return this.configuration;
  }

  async loadConfig(configFilename, target?): Promise<Record<string, unknown>> {
    debug('load config %s.', configFilename);
    let exports = require(configFilename);
    if (exports && exports['default'] && Object.keys(exports).length === 1) {
      exports = exports['default'];
    }
    let result = exports;
    if (isFunction(exports)) {
      // eslint-disable-next-line prefer-spread
      result = exports.apply(null, [
        {
          pkg: this.informationService.getPkg(),
          name: this.informationService.getProjectName(),
          baseDir: this.informationService.getBaseDir(),
          appDir: this.informationService.getAppDir(),
          HOME: this.informationService.getHome(),
          root: this.informationService.getRoot(),
          env: this.environmentService.getCurrentEnvironment(),
        },
        target,
      ]);
    }
    return result;
  }

  clearAllConfig() {
    this.configuration.clear();
  }
}
