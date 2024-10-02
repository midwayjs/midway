import {
  ClassType,
  IModuleStore,
  MethodDecoratorOptions,
  ObjectIdentifier,
  ParamDecoratorOptions,
  TagClsMetadata,
} from '../interface';
import {
  INJECT_CUSTOM_METHOD,
  INJECT_CUSTOM_PARAM,
  INJECT_CUSTOM_PROPERTY,
  PRELOAD_MODULE_KEY,
  TAGGED_CLS,
} from './constant';
import { camelCase } from '../util/camelCase';
import { generateRandomId } from '../util';
import { getModuleRequirePathList } from '../util/pathFileUtil';
import { MetadataManager } from './metadataManager';
import { isClass } from '../util/types';

const debug = require('util').debuglog('midway:core');

/**
 * This class is used to manage the decorator data of the class
 *
 * @since 3.0.0
 */
export class DecoratorManager {
  private static container: IModuleStore;
  private static moduleStore: Map<ObjectIdentifier, Set<any>> = new Map();

  public static saveModule(key: ObjectIdentifier, module) {
    if (isClass(module)) {
      this.saveProviderId(undefined, module);
    }
    if (this.container) {
      return this.container.saveModule(key, module);
    }
    if (!this.moduleStore.has(key)) {
      this.moduleStore.set(key, new Set());
    }
    this.moduleStore.get(key).add(module);
  }

  public static listModule(
    key: ObjectIdentifier,
    filter?: (module) => boolean
  ): any[] {
    let modules: any[];
    if (this.container) {
      modules = this.container.listModule(key);
    } else {
      modules = [...(this.moduleStore.get(key) || [])];
    }
    if (filter) {
      return modules.filter(filter);
    } else {
      return modules;
    }
  }

  public static savePreloadModule(module) {
    this.saveModule(PRELOAD_MODULE_KEY, module);
  }

  public static listPreloadModule(): any[] {
    return this.listModule(PRELOAD_MODULE_KEY);
  }

  public static resetModule(key) {
    this.moduleStore.set(key, new Set());
  }

  public static clearAllModule() {
    this.moduleStore.clear();
  }

  public static bindContainer(container: IModuleStore) {
    this.container = container;
    this.container.transformModule(this.moduleStore);
  }

  public static clearBindContainer() {
    this.container = null;
  }

  public static saveProviderId(
    identifier: ObjectIdentifier,
    target: ClassType
  ) {
    if (this.isProvide(target)) {
      if (identifier) {
        const meta = MetadataManager.getOwnMetadata(TAGGED_CLS, target);
        if (meta.id !== identifier) {
          meta.id = identifier;
          // save class id and uuid
          MetadataManager.defineMetadata(TAGGED_CLS, meta, target);
          debug(`update provide: ${target.name} -> ${meta.uuid}`);
        }
      }
    } else {
      // save
      const uuid = generateRandomId();
      // save class id and uuid
      MetadataManager.defineMetadata(
        TAGGED_CLS,
        {
          id: identifier,
          originName: target.name,
          uuid,
          name: camelCase(target.name),
        },
        target
      );
      debug(`save provide: ${target.name} -> ${uuid}`);
    }

    return target;
  }

  public static getProviderId(module: ClassType): string {
    const metaData = MetadataManager.getOwnMetadata(
      TAGGED_CLS,
      module
    ) as TagClsMetadata;
    if (metaData && metaData.id) {
      return metaData.id;
    }
  }

  public static getProviderName(module: ClassType): string {
    const metaData = MetadataManager.getOwnMetadata(
      TAGGED_CLS,
      module
    ) as TagClsMetadata;
    if (metaData && metaData.name) {
      return metaData.name;
    }
  }

  public static getProviderUUId(module: ClassType): string {
    const metaData = MetadataManager.getOwnMetadata(
      TAGGED_CLS,
      module
    ) as TagClsMetadata;
    if (metaData && metaData.uuid) {
      return metaData.uuid;
    }
  }

  public static isProvide(target: any): boolean {
    return !!MetadataManager.getOwnMetadata(TAGGED_CLS, target);
  }

  public static createCustomPropertyDecorator(
    decoratorKey: string,
    metadata: any,
    impl = true
  ): PropertyDecorator {
    return function (target: any, propertyName: string): void {
      MetadataManager.attachMetadata(
        INJECT_CUSTOM_PROPERTY,
        {
          propertyName,
          key: decoratorKey,
          metadata,
          impl,
        },
        target,
        propertyName
      );
    };
  }

  public static createCustomMethodDecorator(
    decoratorKey: string,
    metadata: any,
    implOrOptions: boolean | MethodDecoratorOptions = { impl: true }
  ): MethodDecorator {
    if (typeof implOrOptions === 'boolean') {
      implOrOptions = { impl: implOrOptions } as MethodDecoratorOptions;
    }
    if (implOrOptions.impl === undefined) {
      implOrOptions.impl = true;
    }
    return function (target: any, propertyName: string) {
      MetadataManager.attachMetadata(
        INJECT_CUSTOM_METHOD,
        {
          propertyName,
          key: decoratorKey,
          metadata,
          options: implOrOptions,
        },
        target
      );
    };
  }

  public static createCustomParamDecorator(
    decoratorKey: string,
    metadata: any,
    implOrOptions: boolean | ParamDecoratorOptions = { impl: true }
  ): ParameterDecorator {
    if (typeof implOrOptions === 'boolean') {
      implOrOptions = { impl: implOrOptions } as ParamDecoratorOptions;
    }
    if (implOrOptions.impl === undefined) {
      implOrOptions.impl = true;
    }
    return function (
      target: any,
      propertyName: string,
      parameterIndex: number
    ) {
      MetadataManager.attachMetadata(
        INJECT_CUSTOM_PARAM,
        {
          key: decoratorKey,
          parameterIndex,
          propertyName,
          metadata,
          options: implOrOptions,
        },
        target,
        propertyName
      );
    };
  }
}

if (typeof globalThis === 'object') {
  if (globalThis['MIDWAY_GLOBAL_DECORATOR_MANAGER']) {
    console.warn(
      'DecoratorManager not singleton and please check @midwayjs/core version by "npm ls @midwayjs/core"'
    );
    const coreModulePathList = getModuleRequirePathList('@midwayjs/core');
    if (coreModulePathList.length) {
      console.info('The module may be located in:');
      coreModulePathList.forEach((path, index) => {
        console.info(`${index + 1}. ${path}`);
      });
    }
  } else {
    globalThis['MIDWAY_GLOBAL_DECORATOR_MANAGER'] = DecoratorManager;
  }
}
