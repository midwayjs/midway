import {
  ClassType,
  MethodDecoratorOptions,
  ObjectIdentifier,
  ParamDecoratorOptions,
  PropertyDecoratorOptions,
  TagClsMetadata,
} from '../interface';
import {
  CUSTOM_METHOD_INJECT_KEY,
  CUSTOM_PARAM_INJECT_KEY,
  CUSTOM_PROPERTY_INJECT_KEY,
  PRE_START_MODULE_KEY,
  PROVIDE_KEY,
} from './constant';
import { camelCase } from '../util/camelCase';
import { generateRandomId } from '../util';
import { getModuleRequirePathList } from '../util/pathFileUtil';
import { MetadataManager } from './metadataManager';
import { isClass } from '../util/types';
import { MidwayInconsistentVersionError } from '../error';

const debug = require('util').debuglog('midway:debug');

/**
 * This class is used to manage the decorator data of the class
 *
 * @since 3.0.0
 */
export class DecoratorManager {
  private static moduleStore: Map<ObjectIdentifier, Set<any>> = new Map();

  public static saveModule(key: ObjectIdentifier, module) {
    if (isClass(module)) {
      this.saveProviderId(undefined, module);
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
    const modules = [...(this.moduleStore.get(key) || [])];
    if (filter) {
      return modules.filter(filter);
    } else {
      return modules;
    }
  }

  public static savePreStartModule(module) {
    this.saveModule(PRE_START_MODULE_KEY, module);
  }

  public static listPreStartModule(): any[] {
    return this.listModule(PRE_START_MODULE_KEY);
  }

  public static resetModule(key) {
    this.moduleStore.set(key, new Set());
  }

  public static clearAllModule() {
    this.moduleStore.clear();
  }

  public static saveProviderId(
    identifier: ObjectIdentifier,
    target: ClassType
  ) {
    if (this.isProvide(target)) {
      if (identifier) {
        const meta = MetadataManager.getOwnMetadata(PROVIDE_KEY, target);
        if (meta.id !== identifier) {
          meta.id = identifier;
          // save class id and uuid
          MetadataManager.defineMetadata(PROVIDE_KEY, meta, target);
          debug(`[core]: Update provide: ${target.name} -> ${meta.uuid}`);
        }
      }
    } else {
      // save
      const uuid = generateRandomId();
      // save class id and uuid
      MetadataManager.defineMetadata(
        PROVIDE_KEY,
        {
          id: identifier,
          originName: target.name,
          uuid,
          name: camelCase(target.name),
        },
        target
      );
      debug(`[core]: Save provide: ${target.name} -> ${uuid}`);
    }

    return target;
  }

  public static getProviderId(module: ClassType): string {
    const metaData = MetadataManager.getOwnMetadata(
      PROVIDE_KEY,
      module
    ) as TagClsMetadata;
    if (metaData && metaData.id) {
      return metaData.id;
    }
  }

  public static getProviderName(module: ClassType): string {
    const metaData = MetadataManager.getOwnMetadata(
      PROVIDE_KEY,
      module
    ) as TagClsMetadata;
    if (metaData && metaData.name) {
      return metaData.name;
    }
  }

  public static getProviderUUId(module: ClassType): string {
    const metaData = MetadataManager.getOwnMetadata(
      PROVIDE_KEY,
      module
    ) as TagClsMetadata;
    if (metaData && metaData.uuid) {
      return metaData.uuid;
    }
  }

  public static isProvide(target: any): boolean {
    return !!MetadataManager.getOwnMetadata(PROVIDE_KEY, target);
  }

  public static createCustomPropertyDecorator(
    decoratorKey: string,
    metadata: any,
    implOrOptions: boolean | PropertyDecoratorOptions = { impl: true }
  ): PropertyDecorator {
    const implOrOpt =
      typeof implOrOptions === 'boolean'
        ? {
            impl: implOrOptions,
          }
        : implOrOptions;
    implOrOpt.impl = implOrOpt.impl ?? true;
    return function (target: any, propertyName: string): void {
      MetadataManager.attachMetadata(
        CUSTOM_PROPERTY_INJECT_KEY,
        {
          propertyName,
          key: decoratorKey,
          metadata,
          options: implOrOptions,
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
    const implOrOpt =
      typeof implOrOptions === 'boolean'
        ? {
            impl: implOrOptions,
          }
        : implOrOptions;
    implOrOpt.impl = implOrOpt.impl ?? true;
    return function (target: any, propertyName: string) {
      MetadataManager.attachMetadata(
        CUSTOM_METHOD_INJECT_KEY,
        {
          propertyName,
          key: decoratorKey,
          metadata,
          options: implOrOpt,
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
        CUSTOM_PARAM_INJECT_KEY,
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

if (
  typeof globalThis === 'object' &&
  globalThis['MIDWAY_GLOBAL_DECORATOR_MANAGER']
) {
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
  throw new MidwayInconsistentVersionError();
} else {
  globalThis['MIDWAY_GLOBAL_DECORATOR_MANAGER'] = DecoratorManager;
}
