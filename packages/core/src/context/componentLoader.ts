import {
  CONFIGURATION_KEY,
  CONFIGURATION_OBJECT_KEY,
  DecoratorManager,
  MAIN_MODULE_KEY,
} from '../decorator';
import { IComponentInfo, IMidwayGlobalContainer, InjectionConfigurationOptions, ScopeEnum } from '../interface';
import { FunctionalConfiguration } from '../functional';
import { MetadataManager } from '../decorator/metadataManager';
import { MidwayConfigService } from '../service/configService';
import { MidwayEnvironmentService } from '../service/environmentService';
import { Types } from '../util/types';
import * as util from 'util';

const debug = util.debuglog('midway:debug');

export class ComponentConfigurationLoader {
  private loadedMap = new WeakMap();
  private namespaceList = [];
  private configurationOptionsList: Array<InjectionConfigurationOptions> = [];
  constructor(readonly container: IMidwayGlobalContainer) {}

  public async load(module) {
    let namespace = MAIN_MODULE_KEY;
    // 可能导出多个
    const configurationExports = this.getConfigurationExport(module);
    if (!configurationExports.length) return;
    // 多个的情况，数据交给第一个保存
    for (let i = 0; i < configurationExports.length; i++) {
      const configurationExport = configurationExports[i];

      if (this.loadedMap.get(configurationExport)) {
        // 已经加载过就跳过循环
        continue;
      }

      let configurationOptions: InjectionConfigurationOptions;
      if (configurationExport instanceof FunctionalConfiguration) {
        // 函数式写法
        configurationOptions = MetadataManager.getOwnMetadata(
          CONFIGURATION_OBJECT_KEY,
          configurationExport
        );
      } else {
        // 普通类写法
        configurationOptions = MetadataManager.getOwnMetadata(
          CONFIGURATION_KEY,
          configurationExport
        );
      }

      // 已加载标记，防止死循环
      this.loadedMap.set(configurationExport, true);

      if (configurationOptions) {
        if (configurationOptions.namespace !== undefined) {
          namespace = configurationOptions.namespace;
          this.namespaceList.push(namespace);
        }
        this.configurationOptionsList.push(configurationOptions);
        debug(`[core]: load configuration in namespace="${namespace}"`);
        this.addImports(configurationOptions.imports);
        this.addImportObjects(configurationOptions.importObjects);
        this.addImportConfigs(configurationOptions.importConfigs);
        this.addImportConfigFilter(configurationOptions.importConfigFilter);

        if (configurationOptions.detector) {
          await configurationOptions.detector.run(this.container, namespace);
        }

        this.bindConfigurationClass(configurationExport, namespace);
      }
    }

    // bind module
    this.container.bindClass(module, {
      namespace,
    });
  }

  private addImportConfigs(
    importConfigs:
      | Array<{ [environmentName: string]: Record<string, any> }>
      | Record<string, any>
  ) {
    if (importConfigs) {
      if (Array.isArray(importConfigs)) {
        this.container.get(MidwayConfigService).add(importConfigs);
      } else {
        this.container.get(MidwayConfigService).addObject(importConfigs);
      }
    }
  }

  private addImportConfigFilter(
    importConfigFilter: (config: Record<string, any>) => Record<string, any>
  ) {
    if (importConfigFilter) {
      this.container.get(MidwayConfigService).addFilter(importConfigFilter);
    }
  }

  private addImports(imports: any[] = []) {
    // 处理 imports
    for (let importPackage of imports) {
      if (!importPackage) continue;
      if (typeof importPackage === 'string') {
        importPackage = require(importPackage);
      }
      if ('Configuration' in importPackage) {
        // component is object
        this.load(importPackage);
      } else if ('component' in importPackage) {
        if ((importPackage as IComponentInfo)?.enabledEnvironment) {
          if (
            (importPackage as IComponentInfo)?.enabledEnvironment?.includes(
              this.container
                .get(MidwayEnvironmentService)
                .getCurrentEnvironment()
            )
          ) {
            this.load((importPackage as IComponentInfo).component);
          }
        } else {
          this.load((importPackage as IComponentInfo).component);
        }
      } else {
        this.load(importPackage);
      }
    }
  }

  /**
   * 注册 importObjects
   * @param objs configuration 中的 importObjects
   */
  private addImportObjects(objs: any) {
    if (objs) {
      const keys = Object.keys(objs);
      for (const key of keys) {
        if (typeof objs[key] !== undefined) {
          this.container.registerObject(key, objs[key]);
        }
      }
    }
  }

  private bindConfigurationClass(clzz, namespace) {
    if (clzz instanceof FunctionalConfiguration) {
      // 函数式写法不需要绑定到容器
    } else {
      // 普通类写法
      DecoratorManager.saveProviderId(undefined, clzz);
      const id = DecoratorManager.getProviderUUId(clzz);
      this.container.bind(id, clzz, {
        namespace: namespace,
        scope: ScopeEnum.Singleton,
      });
    }

    // configuration 手动绑定去重
    const configurationMods = DecoratorManager.listModule(CONFIGURATION_KEY);
    const exists = configurationMods.find(mod => {
      return mod.target === clzz;
    });
    if (!exists) {
      DecoratorManager.saveModule(CONFIGURATION_KEY, {
        target: clzz,
        namespace: namespace,
      });
    }
  }

  private getConfigurationExport(exports): any[] {
    const mods = [];
    if (
      Types.isClass(exports) ||
      Types.isFunction(exports) ||
      exports instanceof FunctionalConfiguration
    ) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (
          Types.isClass(module) ||
          Types.isFunction(module) ||
          module instanceof FunctionalConfiguration
        ) {
          mods.push(module);
        }
      }
    }
    return mods;
  }

  public getNamespaceList() {
    return this.namespaceList;
  }

  public getConfigurationOptionsList() {
    return this.configurationOptionsList;
  }
}
