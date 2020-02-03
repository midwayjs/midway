import { CONFIGURATION_KEY, InjectionConfigurationOptions } from '@midwayjs/decorator';
import { getClassMetadata } from 'injection';
import * as is from 'is-type-of';
import { dirname, isAbsolute, join } from 'path';
import { IContainerConfiguration, IMidwayContainer } from './interface';
import { isPath, safeRequire } from './util';

export class ContainerConfiguration implements IContainerConfiguration {
  container: IMidwayContainer;
  importDirectory = [];
  imports: string[] = [];
  importObjects: object = new Map();

  constructor(container) {
    this.container = container;
  }

  addImports(imports: string[] = [], baseDir?: string) {
    // 处理 imports
    for (let importPackage of imports) {
      // 把相对路径转为绝对路径
      if (isPath(importPackage)) {
        if (!isAbsolute(importPackage)) {
          importPackage = join(baseDir || this.container.baseDir, importPackage);
        }
      } else {
        // for package
        importPackage = this.resolvePackageBaseDir(importPackage);
      }
      this.imports.push(importPackage);
      this.load(importPackage);
    }
  }

  addImportObjects(importObjects: object) {
    if (importObjects) {
      this.importObjects = importObjects;
    }
  }

  addImportConfigs(importConfigs: string[], baseDir: string) {
    if (importConfigs && importConfigs.length) {
      this.container.getConfigService().add(importConfigs.map(importConfigPath => {
        return join(baseDir || this.container.baseDir, importConfigPath);
      }));
    }
  }

  private resolvePackageBaseDir(packageName: string) {
    return dirname(require.resolve(packageName));
  }

  load(packageName: string) {
    let configuration;
    let baseDir = packageName;
    if (isPath(packageName)) {
      const pkg = safeRequire(join(packageName, 'package.json'));
      if (pkg && pkg.main) {
        // 找到 package.json 中的 main 指定的文件目录
        baseDir = dirname(join(packageName, pkg.main));
        configuration = safeRequire(join(baseDir, 'configuration'));
      }
      if (!configuration) {
        // 找外层目录
        configuration = safeRequire(join(packageName, 'configuration'));
      }
    } else {
      // 查找包中的文件
      baseDir = this.resolvePackageBaseDir(packageName);
      configuration = safeRequire(join(baseDir, 'configuration'));
      if (!configuration) {
        configuration = safeRequire(`${packageName}/configuration`);
      }
    }
    this.loadConfiguration(configuration, baseDir);
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

        if (configurationOptions) {
          this.addImports(configurationOptions.imports, baseDir);
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
