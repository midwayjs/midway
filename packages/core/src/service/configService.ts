import { basename, join } from 'path';
import { IConfigService, MidwayAppInfo } from '../interface';
import { safelyGet } from '../util';
import { readdirSync, statSync } from 'fs';
import {
  Init,
  Inject,
  Types,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as util from 'util';
import { MidwayEnvironmentService } from './environmentService';
import { MidwayInformationService } from './informationService';
import { extend } from '../util/extend';
import { MidwayInvalidConfigError } from '../error';

const debug = util.debuglog('midway:debug');

interface ConfigMergeInfo {
  value: any;
  env: string;
  extraPath?: string;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayConfigService implements IConfigService {
  private envDirMap: Map<string, Set<any>> = new Map();
  private aliasMap = {
    prod: 'production',
    unittest: 'test',
  };
  private configMergeOrder: Array<ConfigMergeInfo> = [];
  protected configuration;
  protected isReady = false;
  protected externalObject: Record<string, unknown>[] = [];
  protected appInfo: MidwayAppInfo;

  @Inject()
  protected environmentService: MidwayEnvironmentService;

  @Inject()
  protected informationService: MidwayInformationService;

  @Init()
  protected init() {
    this.appInfo = {
      pkg: this.informationService.getPkg(),
      name: this.informationService.getProjectName(),
      baseDir: this.informationService.getBaseDir(),
      appDir: this.informationService.getAppDir(),
      HOME: this.informationService.getHome(),
      root: this.informationService.getRoot(),
      env: this.environmentService.getCurrentEnvironment(),
    };
  }

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
          if (this.aliasMap[env]) {
            this.getEnvSet(this.aliasMap[env]).add(dir[env]);
          } else {
            this.getEnvSet(env).add(dir[env]);
          }
        }
      }
    }
  }

  addObject(obj: Record<string, unknown>, reverse = false) {
    if (this.isReady) {
      this.configMergeOrder.push({
        env: 'default',
        extraPath: '',
        value: obj,
      });
      if (reverse) {
        this.configuration = extend(true, obj, this.configuration);
      } else {
        extend(true, this.configuration, obj);
      }
    } else {
      this.externalObject.push(obj);
    }
  }

  private getEnvSet(env) {
    if (!this.envDirMap.has(env)) {
      this.envDirMap.set(env, new Set());
    }
    return this.envDirMap.get(env);
  }

  private getConfigEnv(configFilePath) {
    // parse env
    const configFileBaseName = basename(configFilePath);
    const splits = configFileBaseName.split('.');
    const suffix = splits.pop();
    if (suffix !== 'js' && suffix !== 'ts') {
      return suffix;
    }
    return splits.pop();
  }

  load() {
    if (this.isReady) return;
    // get default
    const defaultSet = this.getEnvSet('default');
    // get current set
    const currentEnvSet = this.getEnvSet(
      this.environmentService.getCurrentEnvironment()
    );
    // merge set
    const target = {};
    const defaultSetLength = defaultSet.size;
    for (const [idx, filename] of [...defaultSet, ...currentEnvSet].entries()) {
      let config = this.loadConfig(filename);
      if (Types.isFunction(config)) {
        // eslint-disable-next-line prefer-spread
        config = config.apply(null, [this.appInfo, target]);
      }

      if (!config) {
        continue;
      }

      if (typeof filename === 'string') {
        debug('[config]: Loaded config %s, %j', filename, config);
      } else {
        debug('[config]: Loaded config %j', config);
      }
      this.configMergeOrder.push({
        env:
          idx < defaultSetLength
            ? 'default'
            : this.environmentService.getCurrentEnvironment(),
        extraPath: filename,
        value: config,
      });

      extend(true, target, config);
    }
    if (this.externalObject.length) {
      for (const externalObject of this.externalObject) {
        if (externalObject) {
          debug('[config]: Loaded external object %j', externalObject);
          extend(true, target, externalObject);
          this.configMergeOrder.push({
            env: 'default',
            extraPath: '',
            value: externalObject,
          });
        }
      }
    }
    this.configuration = target;
    this.isReady = true;
  }

  getConfiguration(configKey?: string) {
    if (configKey) {
      return safelyGet(configKey, this.configuration);
    }
    return this.configuration;
  }

  getConfigMergeOrder(): Array<ConfigMergeInfo> {
    return this.configMergeOrder;
  }

  private loadConfig(
    configFilename
  ): (...args) => any | Record<string, unknown> {
    let exports =
      typeof configFilename === 'string'
        ? require(configFilename)
        : configFilename;

    // if es module
    if (exports && exports.__esModule) {
      if (exports && exports.default) {
        if (Object.keys(exports).length > 1) {
          throw new MidwayInvalidConfigError(
            `${configFilename} should not have both a default export and named export`
          );
        }
        exports = exports.default;
      }
    } else {
      console.log(exports);
    }

    return exports;
  }

  clearAllConfig() {
    this.configuration.clear();
  }

  clearConfigMergeOrder() {
    this.configMergeOrder.length = 0;
  }
}
