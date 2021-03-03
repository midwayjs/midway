import {
  classNamed,
  CONFIGURATION_KEY,
  FrameworkContainerScopeEnum,
  generateProvideId,
  getClassMetadata,
  IComponentInfo,
  InjectionConfigurationOptions,
  isClass,
  isFunction,
  LIFECYCLE_IDENTIFIER_PREFIX,
  listModule,
  MAIN_MODULE_KEY,
  saveModule,
  saveProviderId,
} from '@midwayjs/decorator';

import { dirname, isAbsolute, join } from 'path';
import { IContainerConfiguration, IMidwayContainer } from '../interface';
import { safeRequire } from '../util/';
import { PathFileUtil } from '../util/pathFileUtil';
import * as util from 'util';
import { FunctionalConfiguration } from '../functional/configuration';

const debug = util.debuglog('midway:container:configuration');

export class ContainerConfiguration implements IContainerConfiguration {
  container: IMidwayContainer & {
    bindClass(exports, namespace: string);
  };
  namespace: string;
  packageName: string;
  loadDirs: string[] = [];
  loadModules: any[] = [];
  importObjects = {};
  // 新版本 configuration
  newVersion = false;

  constructor(container) {
    this.container = container;
  }

  addLoadDir(dir: string) {
    this.loadDirs.push(dir);
  }

  addImports(imports: any[] = [], baseDir?: string) {
    // 处理 imports
    for (const importPackage of imports) {
      if (!importPackage) continue;
      // for package
      const subContainerConfiguration = this.container.createConfiguration();
      if (typeof importPackage === 'string') {
        subContainerConfiguration.newVersion = false;
        const subPackageDir = this.resolvePackageBaseDir(
          importPackage,
          baseDir
        );
        debug(
          `\n---------- start load configuration from sub package "${importPackage}" ----------`
        );
        subContainerConfiguration.load(subPackageDir);
        debug(
          `---------- end load configuration from sub package "${importPackage}" ----------`
        );
      } else if ('Configuration' in importPackage) {
        subContainerConfiguration.newVersion = true;
        // component is object
        debug(
          '\n---------- start load configuration from submodule" ----------'
        );
        subContainerConfiguration.loadComponentObject(importPackage);
        debug(
          `---------- end load configuration from sub package "${importPackage}" ----------`
        );
      } else if ('component' in importPackage) {
        subContainerConfiguration.newVersion = true;
        if (
          (importPackage as IComponentInfo)?.enabledEnvironment?.includes(
            this.container.getCurrentEnv()
          )
        ) {
          subContainerConfiguration.loadComponentObject(
            (importPackage as IComponentInfo).component
          );
        }
      } else {
        throw new Error(
          'import module not a midway component, module =' +
            util.inspect(importPackage)
        );
      }
    }
  }

  addImportObjects(importObjects: Record<string, unknown>) {
    if (importObjects) {
      this.importObjects = importObjects;
    }
  }

  getImportObjects() {
    return this.importObjects;
  }

  addImportConfigs(importConfigs: string[], baseDir: string) {
    if (importConfigs && importConfigs.length) {
      debug(
        '   import configs %j from baseDir => "%s".',
        importConfigs,
        baseDir
      );
      this.container.getConfigService().add(
        importConfigs.map(importConfigPath => {
          if (isAbsolute(importConfigPath)) {
            return importConfigPath;
          } else {
            return join(baseDir || this.container.baseDir, importConfigPath);
          }
        })
      );
    }
  }

  private resolvePackageBaseDir(packageName: string, baseDir?: string) {
    // 把相对路径转为绝对路径
    if (PathFileUtil.isPath(packageName)) {
      if (!isAbsolute(packageName)) {
        packageName = join(baseDir || this.container.baseDir, packageName);
      }
      return packageName;
    }
    try {
      return dirname(require.resolve(packageName));
    } catch (e) {
      /* ignore */
    }
    return join(
      baseDir || this.container.baseDir,
      '../node_modules',
      packageName
    );
  }

  load(packageName: string) {
    let isSubDir = false;
    let packageBaseDir = this.resolvePackageBaseDir(packageName);
    // package name is a path
    if (packageName === packageBaseDir) {
      debug('load configuration.ts from "%s"', packageName);
    } else {
      // package name is a normal npm package
      debug(
        'load configuration.ts in "%s" from "%s"',
        packageName,
        packageBaseDir
      );
    }
    let pkg = safeRequire(join(packageBaseDir, 'package.json'));
    if (!pkg) {
      isSubDir = true;
      pkg = safeRequire(join(packageBaseDir, '../', 'package.json'));
    }
    if (pkg) {
      debug(
        'found package.json and name-version => "%s", from "%s".',
        `${pkg.name}-${pkg.version}`,
        packageBaseDir
      );
    } else {
      // no package.json
      debug('not found package.json from "%s".', packageBaseDir);
      debug(
        `will be load configuration.ts from "${packageBaseDir}/configuration" directly`
      );
    }

    let configuration;
    let cfgFile;
    let loadDir;
    if (pkg) {
      this.packageName = pkg.name;
      if (this.namespace !== MAIN_MODULE_KEY) {
        this.namespace =
          pkg.midwayNamespace !== undefined ? pkg.midwayNamespace : pkg.name;
      }
      if (pkg.main && !isSubDir) {
        packageBaseDir = dirname(join(packageBaseDir, pkg.main));
        cfgFile = join(packageBaseDir, 'configuration');
        configuration = safeRequire(cfgFile);
        debug('current case 1 => configuration file "%s".', cfgFile);
        loadDir = packageBaseDir;
      }
    }
    if (!configuration) {
      cfgFile = `${packageBaseDir}/configuration`;
      configuration = safeRequire(cfgFile);
      debug('current case 2 => configuration file "%s".', cfgFile);
      loadDir = packageBaseDir;
    }
    if (loadDir) {
      this.addLoadDir(loadDir);
      debug('   add loadDir => "%s".', loadDir);
      debug('   add namespace => "%s".', this.namespace);
    }
    debug('   has configuration file => %s.', !!configuration);
    this.loadConfiguration(configuration, packageBaseDir, cfgFile);
  }

  loadComponentObject(componentObject) {
    if (!componentObject || !componentObject['Configuration']) {
      return;
    }

    this.loadConfiguration(componentObject['Configuration'], '');
    let configurationOptions: InjectionConfigurationOptions;
    if (componentObject['Configuration'] instanceof FunctionalConfiguration) {
      // 函数式写法
      configurationOptions = componentObject[
        'Configuration'
      ].getConfigurationOptions();
    } else {
      // 普通类写法
      configurationOptions = getClassMetadata(
        CONFIGURATION_KEY,
        componentObject['Configuration']
      );
    }

    const ns = configurationOptions.namespace || MAIN_MODULE_KEY;
    this.container.bindClass(componentObject, ns);
  }

  loadConfiguration(configuration, baseDir, filePath?: string) {
    if (configuration) {
      // 可能导出多个
      const configurationExports = this.getConfigurationExport(configuration);
      if (!configurationExports.length) return;
      // 多个的情况，数据交给第一个保存
      for (let i = 0; i < configurationExports.length; i++) {
        const configurationExport = configurationExports[i];
        let configurationOptions: InjectionConfigurationOptions;
        if (configurationExport instanceof FunctionalConfiguration) {
          // 函数式写法
          configurationOptions = configurationExport.getConfigurationOptions();
        } else {
          // 普通类写法
          configurationOptions = getClassMetadata(
            CONFIGURATION_KEY,
            configurationExport
          );
        }

        debug('   configuration export %j.', configurationOptions);
        if (configurationOptions) {
          if (
            this.namespace !== MAIN_MODULE_KEY &&
            configurationOptions.namespace !== undefined
          ) {
            this.namespace = configurationOptions.namespace;
          }

          if (!this.packageName) {
            this.packageName = this.namespace;
          }

          if (
            i === 0 &&
            this.container.containsConfiguration(this.packageName) &&
            this.namespace !== ''
          ) {
            debug(
              `   configuration "namespace(${this.namespace})/packageName(${this.packageName})" exist than ignore.`
            );
            return;
          } else {
            debug(
              `   configuration "namespace(${this.namespace})/packageName(${this.packageName})" not exist than add.`
            );
            this.container.addConfiguration(this);
          }
          if (configurationOptions.directoryResolveFilter) {
            this.container.addDirectoryFilter(
              configurationOptions.directoryResolveFilter
            );
          }
          if (i === 0 && this.namespace === MAIN_MODULE_KEY) {
            // set conflictCheck
            if (configurationOptions.conflictCheck === undefined) {
              configurationOptions.conflictCheck = false;
            }
            this.container.disableConflictCheck = !configurationOptions.conflictCheck;
            // set applicationContext scope
            this.container.setFrameworkContainerScope(
              configurationOptions.frameworkContainerScope ||
                FrameworkContainerScopeEnum.GLOBAL
            );
          }

          this.addImports(configurationOptions.imports, baseDir);
          this.addImportObjects(configurationOptions.importObjects);
          this.addImportConfigs(configurationOptions.importConfigs, baseDir);
          this.bindConfigurationClass(configurationExport, filePath);
        }
      }
    } else {
      if (this.namespace === MAIN_MODULE_KEY) {
        this.container.disableConflictCheck = true;
      }
      if (
        this.container.containsConfiguration(this.packageName) &&
        this.namespace !== ''
      ) {
        debug(
          `   configuration "namespace(${this.namespace})/packageName(${this.packageName})" exist than ignore.`
        );
        return;
      } else {
        debug(
          `   configuration "namespace(${this.namespace})/packageName(${this.packageName})" not exist than add.`
        );
        this.container.addConfiguration(this);
      }
    }
  }

  /**
   * 用于 ready 或者 stop 时处理 lifecycle 实现
   * @param clzz configuration class
   */
  bindConfigurationClass(clzz, filePath?: string) {
    if (clzz instanceof FunctionalConfiguration) {
      // 函数式写法不需要绑定到容器
    } else {
      // 普通类写法
      const clzzName = `${LIFECYCLE_IDENTIFIER_PREFIX}${classNamed(clzz.name)}`;
      const id = generateProvideId(clzzName, this.namespace);
      saveProviderId(id, clzz, true);
      this.container.bind(id, clzz, {
        namespace: this.namespace,
        srcPath: filePath,
      });
    }

    // configuration 手动绑定去重
    const configurationMods = listModule(CONFIGURATION_KEY);
    const exists = configurationMods.find(mod => {
      return mod.target === clzz;
    });
    if (!exists) {
      saveModule(CONFIGURATION_KEY, {
        target: clzz,
        namespace: this.namespace,
      });
    }
  }

  getImportDirectory() {
    return this.loadDirs;
  }

  private getConfigurationExport(exports): any[] {
    const mods = [];
    if (
      isClass(exports) ||
      isFunction(exports) ||
      exports instanceof FunctionalConfiguration
    ) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (
          isClass(module) ||
          isFunction(module) ||
          module instanceof FunctionalConfiguration
        ) {
          mods.push(module);
        }
      }
    }
    return mods;
  }
}
