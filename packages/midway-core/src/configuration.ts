import { CONFIGURATION_KEY } from '@midwayjs/decorator';
import { join, dirname, isAbsolute } from 'path';
import { getClassMetadata } from 'injection';
import { IContainerConfiguration, IMidwayContainer } from './interface';
import { safeRequire } from './util';

export class ContainerConfiguration implements IContainerConfiguration {
  container: IMidwayContainer;
  preloadModules;
  readyBindModules: Map<string, Set<any>> = new Map();
  importDirectory = [];
  imports: string[] = [];
  importObjects: object = new Map();

  constructor(container) {
    this.container = container;
  }

  addImports(imports: string[]) {
    // 处理 imports
    for (const importPackage of imports) {
      this.load(importPackage);
    }
    this.imports = this.imports.concat(imports);
  }

  addImportObjects(importObjects: object) {
    this.importObjects = importObjects;
  }

  resolvePackageBaseDir(packageName: string) {
    return dirname(require.resolve(packageName));
  }

  load(packageName: string) {
    let configuration;
    if (isAbsolute(packageName)) {
      configuration = safeRequire(join(packageName, 'configuration'));
    } else {
      configuration = safeRequire(`${packageName}/configuration`);
    }
    if (configuration) {
      const configurationOptions = getClassMetadata(
        CONFIGURATION_KEY,
        configuration
      );

      if (configurationOptions.imports) {
        configuration.addImports(configurationOptions.imports);
      }
      if (configurationOptions.importObjects) {
        configuration.addImportObjects(configurationOptions.importObjects);
      }
    }
  }

  getImportDirectory() {
    return this.imports.map(importModule => {
      return this.resolvePackageBaseDir(importModule);
    });
  }
}
