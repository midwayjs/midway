import { basename, join } from 'path';
import { IConfigService, MidwayAppInfo } from '../interface';
import { safelyGet } from '../util';
import { readdirSync, statSync } from 'fs';
import * as util from 'util';
import { MidwayEnvironmentService } from './environmentService';
import { MidwayInformationService } from './informationService';
import { extend } from '../util/extend';
import { MidwayInvalidConfigError } from '../error';
import { Init, Inject, Provide, Scope, ScopeEnum } from '../decorator';
import { Types } from '../util/types';

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
  protected configuration = {};
  protected isReady = false;
  protected externalObject: Record<string, unknown>[] = [];
  protected appInfo: MidwayAppInfo;
  protected configFilterList: Array<
    (config: Record<string, any>) => Record<string, any> | undefined
  > = [];

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

  public add(configFilePaths: any[]) {
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
          this.getEnvSet(env).add(dir[env]);
          if (this.aliasMap[env]) {
            this.getEnvSet(this.aliasMap[env]).add(dir[env]);
          }
        }
      }
    }
  }

  public addObject(obj: Record<string, unknown>, reverse = false) {
    if (this.isReady) {
      obj = this.runWithFilter(obj);

      if (!obj) {
        debug('[config]: Filter config and got undefined will be drop it');
        return;
      }
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

  public load() {
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
      let config: Record<string, any> = this.loadConfig(filename);
      if (Types.isFunction(config)) {
        // eslint-disable-next-line prefer-spread
        config = config.apply(null, [this.appInfo, target]);
      }

      if (!config) {
        continue;
      }

      config = this.runWithFilter(config);

      if (!config) {
        debug('[config]: Filter config and got undefined will be drop it');
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
      for (let externalObject of this.externalObject) {
        if (externalObject) {
          externalObject = this.runWithFilter(externalObject);
          if (!externalObject) {
            debug('[config]: Filter config and got undefined will be drop it');
            continue;
          }

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

  public getConfiguration(configKey?: string) {
    if (configKey) {
      return safelyGet(configKey, this.configuration);
    }
    return this.configuration;
  }

  public getConfigMergeOrder(): Array<ConfigMergeInfo> {
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
    }

    return exports;
  }

  public clearAllConfig() {
    this.configuration = {};
  }

  public clearConfigMergeOrder() {
    this.configMergeOrder.length = 0;
  }

  /**
   * add a config filter
   * @param filter
   */
  public addFilter(
    filter: (config: Record<string, any>) => Record<string, any>
  ) {
    this.configFilterList.push(filter);
  }

  protected runWithFilter(config: Record<string, any>): Record<string, any> {
    for (const filter of this.configFilterList) {
      debug(
        `[config]: Filter config by filter = "${
          filter.name || 'anonymous filter'
        }"`
      );
      config = filter(config);
      debug('[config]: Filter config result = %j', config);
    }
    return config;
  }
}
