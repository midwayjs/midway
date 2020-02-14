import { CONFIGURATION_KEY, InjectionConfigurationOptions, getClassMetadata } from '@midwayjs/decorator';
import * as is from 'is-type-of';
import { dirname, isAbsolute, join } from 'path';
import { IContainerConfiguration, IMidwayContainer, MAIN_MODULE_KEY } from '../interface';
import { isPath, safeRequire } from '../common/util';

const debug = require('debug')('midway:container:configuration');

export class ContainerConfiguration implements IContainerConfiguration {
  container: IMidwayContainer;
  namespace: string;
  imports: string[] = [];
  importObjects: object = new Map();

  constructor(container) {
    this.container = container;
  }

  addImports(imports: string[] = [], baseDir?: string) {
    // 处理 imports
    for (let importPackage of imports) {
      // for package
      importPackage = this.resolvePackageBaseDir(importPackage, baseDir);
      debug('import package => %s.', importPackage);
      this.imports.push(importPackage);
    }
  }

  addImportObjects(importObjects: object) {
    if (importObjects) {
      this.importObjects = importObjects;
    }
  }

  addImportConfigs(importConfigs: string[], baseDir: string) {
    debug('import configs %j baseDir => %s.', importConfigs, baseDir);
    if (importConfigs && importConfigs.length) {
      this.container.getConfigService().add(importConfigs.map(importConfigPath => {
        return join(baseDir || this.container.baseDir, importConfigPath);
      }));
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
    } catch (e) { /* ignore */ }
    return join(baseDir || this.container.baseDir, '../node_modules', packageName);
  }

  load(packageName: string) {
    let configuration;
    const packageBaseDir = this.resolvePackageBaseDir(packageName);
    debug('load %s => %s.', packageName, packageBaseDir);
    let pkg = safeRequire(join(packageBaseDir, 'package.json'));
    if (!pkg) {
      pkg = safeRequire(join(packageBaseDir, '../', 'package.json'));
    }
    debug('safeRequire pkg.name => %s, from %s.', pkg ? pkg.name : undefined, packageBaseDir);

    if (pkg) {
      if (this.namespace !== MAIN_MODULE_KEY) {
        this.namespace = pkg.midwayNamespace ? pkg.midwayNamespace : pkg.name;
      }
      let cfgFile;
      if (pkg.main) {
        const cfgFileDir = dirname(join(packageBaseDir, pkg.main));
        cfgFile = join(cfgFileDir, 'configuration');
        configuration = safeRequire(cfgFile);
        debug('configuration file path one => %s.', cfgFile);
      }
      if (!configuration) {
        cfgFile = `${packageBaseDir}/configuration`;
        configuration = safeRequire(cfgFile);
        debug('configuration file path two => %s.', cfgFile);
      }
    }
    debug('packageName => %s namespace => %s configuration file => %s.',
      packageName, this.namespace, configuration ? true : false);
    this.loadConfiguration(configuration, packageBaseDir);
  }

  loadConfiguration(configuration, baseDir) {
    if (configuration) {
      // 可能导出多个
      const configurationExports = this.getConfigurationExport(configuration);
      for (const configurationExport of configurationExports) {
        const configurationOptions: InjectionConfigurationOptions = getClassMetadata(
          CONFIGURATION_KEY,
          configurationExport
        );
        debug('configuration export %j.', configurationOptions);
        if (configurationOptions) {
          if (this.namespace !== MAIN_MODULE_KEY && configurationOptions.namespace) {
            this.namespace = configurationOptions.namespace;
          }
          if (this.namespace === MAIN_MODULE_KEY) {
            // 只支持一层
            for (const importPackage of configurationOptions.imports) {
              const subContainerConfiguration = this.container.createConfiguration();
              const subPackageDir = this.resolvePackageBaseDir(importPackage);
              debug('import package => %s dir => %s.', importPackage, subPackageDir);
              subContainerConfiguration.load(subPackageDir);
              subContainerConfiguration.addImports([ subPackageDir ]);
            }
          }
          this.addImportObjects(configurationOptions.importObjects);
          this.addImportConfigs(configurationOptions.importConfigs, baseDir);
        }
      }
    }
  }

  getImportDirectory() {
    return this.imports;
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
