import { CONFIGURATION_KEY } from '@midwayjs/decorator';
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

  addImports(imports: string[]) {
    // 处理 imports
    for (let importPackage of imports) {
      // 把相对路径转为绝对路径
      if (isPath(importPackage)) {
        if (!isAbsolute(importPackage)) {
          importPackage = join(this.container.baseDir, importPackage);
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
    this.importObjects = importObjects;
  }

  private resolvePackageBaseDir(packageName: string) {
    return dirname(require.resolve(packageName));
  }

  load(packageName: string) {
    let configuration;
    if (isPath(packageName)) {
      const pkg = safeRequire(join(packageName, 'package.json'));
      if (pkg && pkg.main) {
        // 找到 package.json 中的 main 指定的文件目录
        const innerDir = dirname(join(packageName, pkg.main));
        configuration = safeRequire(join(innerDir, 'configuration'));
      }
      if (!configuration) {
        // 找外层目录
        configuration = safeRequire(join(packageName, 'configuration'));
      }
    } else {
      // 查找包中的文件
      const innerDir = this.resolvePackageBaseDir(packageName);
      configuration = safeRequire(join(innerDir, 'configuration'));
      if (!configuration) {
        configuration = safeRequire(`${packageName}/configuration`);
      }
    }
    this.loadConfiguration(configuration);
  }

  loadConfiguration(configuration) {
    if (configuration) {
      // 可能导出多个
      const configurationExports = this.getConfigurationExport(configuration);
      for (const configurationExport of configurationExports) {
        const configurationOptions = getClassMetadata(
          CONFIGURATION_KEY,
          configurationExport
        );

        if (configurationOptions) {
          if (configurationOptions.imports) {
            this.addImports(configurationOptions.imports);
          }
          if (configurationOptions.importObjects) {
            this.addImportObjects(configurationOptions.importObjects);
          }
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
