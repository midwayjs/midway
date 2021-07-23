import {
  classNamed,
  CONFIGURATION_KEY,
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
  ScopeEnum,
} from '@midwayjs/decorator';
import { FunctionalConfiguration } from '../functional/configuration';
import * as util from 'util';
import { BaseApplicationContext } from './applicationContext';

const debug = util.debuglog('midway:container:configuration');

class ContainerConfiguration {
  private namespace;

  constructor(readonly container) {}

  load(module) {
    // 可能导出多个
    const configurationExports = this.getConfigurationExport(module);
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

        // if (i === 0 && this.namespace === MAIN_MODULE_KEY) {
        //   // set conflictCheck
        //   if (configurationOptions.conflictCheck === undefined) {
        //     configurationOptions.conflictCheck = false;
        //   }
        //   this.container.disableConflictCheck =
        //     !configurationOptions.conflictCheck;
        // }

        this.addImports(configurationOptions.imports);
        this.bindConfigurationClass(configurationExport);
      }
    }
  }

  addImports(imports: any[] = []) {
    // 处理 imports
    for (const importPackage of imports) {
      if (!importPackage) continue;
      // for package
      const subContainerConfiguration = this.container.createConfiguration();
      if ('Configuration' in importPackage) {
        // component is object
        debug(
          '\n---------- start load configuration from submodule" ----------'
        );
        subContainerConfiguration.load(importPackage);
        debug(
          `---------- end load configuration from sub package "${importPackage}" ----------`
        );
      } else if ('component' in importPackage) {
        if (
          (importPackage as IComponentInfo)?.enabledEnvironment?.includes(
            this.container.getCurrentEnv()
          )
        ) {
          subContainerConfiguration.load(
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
        scope: ScopeEnum.Singleton,
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

export class MidwayContainer extends BaseApplicationContext {
  load(module) {
    const configuration = this.createConfiguration();
    configuration.load(module);
  }

  createConfiguration() {
    return new ContainerConfiguration(this);
  }

  async ready() {
    return super.ready();
  }
}
