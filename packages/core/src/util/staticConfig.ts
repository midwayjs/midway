import { join } from 'path';
import { CONFIGURATION_KEY, getClassMetadata, InjectionConfigurationOptions } from '@midwayjs/decorator';
import { IConfigService, safeRequire } from '..';
import { MidwayConfigService } from '../service/configService';
import { isClass, isFunction } from './index';

export class StaticConfigLoader {

  baseDir: string;
  configService: IConfigService;

  constructor(baseDir: string, currentEnvironment: string) {
    this.baseDir = baseDir;
    this.configService = new MidwayConfigService({getCurrentEnv() {return currentEnvironment}});
  }

  async getSerializeConfig(): Promise<string> {
    const mainModule = safeRequire(this.baseDir);
    let mainConfiguration;

    if (mainModule && mainModule['Configuration']) {
      mainConfiguration = mainModule['Configuration'];
    } else {
      mainConfiguration = safeRequire(join(this.baseDir, 'src', 'configuration.ts'));
    }

    const modules = this.getConfigurationExport(mainConfiguration);
    for (const module of modules) {
      this.analyzeConfiguration(module);
    }
    await this.configService.load();
    return this.configService.getConfiguration();
  }

  analyzeConfiguration(configurationModule) {
    if (!configurationModule) return;
    const configurationOptions: InjectionConfigurationOptions = getClassMetadata(
      CONFIGURATION_KEY,
      configurationModule
    );

    if (!configurationOptions) return;

    if (configurationOptions.imports) {
      for (const importModule of configurationOptions.imports) {
        if (typeof importModule !== 'string') {
          this.analyzeConfiguration(importModule['Configuration']);
        }
      }
    }

    if (configurationOptions?.importConfigs) {
      this.configService.add(configurationOptions.importConfigs);
    }
  }

  private getConfigurationExport(exports): any[] {
    const mods = [];
    if (isClass(exports) || isFunction(exports)) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (isClass(module) || isFunction(module)) {
          mods.push(module);
        }
      }
    }
    return mods;
  }
}
