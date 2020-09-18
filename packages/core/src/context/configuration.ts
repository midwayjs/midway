import {
  CONFIGURATION_KEY,
  InjectionConfigurationOptions,
  getClassMetadata,
  LIFECYCLE_IDENTIFIER_PREFIX,
  classNamed,
  saveModule,
  saveProviderId,
} from '@midwayjs/decorator';
import * as is from 'is-type-of';
import { dirname, isAbsolute, join } from 'path';
import {
  IContainerConfiguration,
  IMidwayContainer,
  MAIN_MODULE_KEY,
} from '../interface';
import { isPath, safeRequire, generateProvideId } from '../common/util';

const debug = require('debug')('midway:container:configuration');

export class ContainerConfiguration implements IContainerConfiguration {
  container: IMidwayContainer;
  namespace: string;
  packageName: string;
  loadDirs: string[] = [];
  importObjects: object = new Map();

  constructor(container) {
    this.container = container;
  }

  addLoadDir(dir: string) {
    this.loadDirs.push(dir);
  }

  addImports(imports: string[] = [], baseDir?: string) {
    // 处理 imports
    for (const importPackage of imports) {
      // for package
      const subContainerConfiguration = this.container.createConfiguration();
      const subPackageDir = this.resolvePackageBaseDir(importPackage, baseDir);
      debug(
        `\n---------- start load configuration from sub package "${importPackage}" ----------`
      );
      subContainerConfiguration.load(subPackageDir);
      debug(
        `---------- end load configuration from sub package "${importPackage}" ----------`
      );
    }
  }

  addImportObjects(importObjects: object) {
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
    if (isPath(packageName)) {
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
    debug('   has configuration file => %s.', configuration ? true : false);
    this.loadConfiguration(configuration, packageBaseDir, cfgFile);
  }

  loadConfiguration(configuration, baseDir, filePath?: string) {
    if (configuration) {
      // 可能导出多个
      const configurationExports = this.getConfigurationExport(configuration);
      for (const configurationExport of configurationExports) {
        const configurationOptions: InjectionConfigurationOptions = getClassMetadata(
          CONFIGURATION_KEY,
          configurationExport
        );
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
          this.addImports(configurationOptions.imports, baseDir);
          this.addImportObjects(configurationOptions.importObjects);
          this.addImportConfigs(configurationOptions.importConfigs, baseDir);
          this.bindConfigurationClass(configurationExport, filePath);
        }
      }
    } else {
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
    const clzzName = `${LIFECYCLE_IDENTIFIER_PREFIX}${classNamed(clzz.name)}`;
    const id = generateProvideId(clzzName, this.namespace);
    saveProviderId(id, clzz, true);
    this.container.bind(id, clzz, {
      namespace: this.namespace,
      srcPath: filePath,
    });
    saveModule(CONFIGURATION_KEY, clzz);
  }

  getImportDirectory() {
    return this.loadDirs;
  }

  private getConfigurationExport(exports): any[] {
    const mods = [];
    if (is.class(exports) || is.function(exports)) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (is.class(module) || is.function(module)) {
          mods.push(module);
        }
      }
    }
    return mods;
  }
}
