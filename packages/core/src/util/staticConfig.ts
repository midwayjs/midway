import { join } from 'path';
import { CONFIGURATION_KEY, getClassMetadata, InjectionConfigurationOptions } from '@midwayjs/decorator';
import { IConfigService, safeRequire } from '..';
import { MidwayConfigService } from '../service/configService';
import { serialize } from 'class-transformer';

export class StaticConfigLoader {

  baseDir: string;
  configService: IConfigService;

  constructor(baseDir: string, currentEnvironment: string) {
    this.baseDir = baseDir;
    this.configService = new MidwayConfigService({getCurrentEnv() {return currentEnvironment}});
  }

  getSerializeConfig(): string {
    const mainModule = safeRequire(this.baseDir);
    let mainConfiguration;

    if (mainModule && mainModule['Configuration']) {
      mainConfiguration = mainModule['Configuration'];
    } else {
      mainConfiguration = safeRequire(join(this.baseDir, 'src', 'configuration.ts'));
    }
    this.analyzeConfiguration(mainConfiguration);
    return serialize(this.configService.load());
  }

  analyzeConfiguration(configurationModule) {
    if (!configurationModule) return;
    const configurationOptions: InjectionConfigurationOptions = getClassMetadata(
      CONFIGURATION_KEY,
      configurationModule
    );

    for (const importModule of configurationOptions.imports) {
      if (typeof importModule !== 'string') {
        this.analyzeConfiguration(importModule['Configuration']);
      }
    }

    if (configurationOptions.importConfigs) {
      this.configService.add(configurationOptions.importConfigs);
    }
  }
}
