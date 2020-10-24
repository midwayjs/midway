import 'reflect-metadata';
import {
  generateProvideId,
  getConstructorInject,
  getObjectDefProps,
  getProviderId,
  isAsyncFunction,
  isClass,
  isFunction,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  ScopeEnum,
  TAGGED_PROP,
} from '@midwayjs/decorator';
import { IContainer, IObjectDefinitionMetadata } from '../interface';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { ManagedReference, ManagedValue } from './managed';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { BaseApplicationContext } from './applicationContext';
import { recursiveGetMetadata } from '../common/reflectTool';
import * as util from 'util';

const globalDebugLogger = util.debuglog('midway:container');

export class Container extends BaseApplicationContext implements IContainer {
  id = Math.random().toString(10).slice(-5);
  debugLogger = globalDebugLogger;
  definitionMetadataList = [];
  bind<T>(target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
  ): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
  ): void {
    const definitionMeta = {} as IObjectDefinitionMetadata;
    this.definitionMetadataList.push(definitionMeta);

    if (isClass(identifier) || isFunction(identifier)) {
      options = target;
      target = identifier as any;
      identifier = this.getIdentifier(target);
      options = null;
    }

    if (isClass(target)) {
      definitionMeta.definitionType = 'object';
    } else {
      definitionMeta.definitionType = 'function';
      if (!isAsyncFunction(target)) {
        definitionMeta.asynchronous = false;
      }
    }

    definitionMeta.path = target;
    definitionMeta.id = identifier;
    definitionMeta.srcPath = options?.srcPath || null;
    definitionMeta.namespace = options?.namespace || '';
    definitionMeta.scope = options?.scope || ScopeEnum.Singleton;
    definitionMeta.autowire = options?.isAutowire !== false;

    this.debugLogger(`  bind id => [${definitionMeta.id}]`);

    // inject constructArgs
    const constructorMetaData = getConstructorInject(target);
    if (constructorMetaData) {
      this.debugLogger(`inject constructor => length = ${target['length']}`);
      definitionMeta.constructorArgs = [];
      const maxLength = Math.max.apply(null, Object.keys(constructorMetaData));
      for (let i = 0; i < maxLength + 1; i++) {
        const propertyMeta = constructorMetaData[i];
        if (propertyMeta) {
          definitionMeta.constructorArgs.push({
            type: 'ref',
            value: propertyMeta[0].value,
            args: propertyMeta[0].args,
          });
        } else {
          definitionMeta.constructorArgs.push({
            type: 'value',
            value: propertyMeta?.[0].value,
          });
        }
      }
    }

    // inject properties
    const metaDatas = recursiveGetMetadata(TAGGED_PROP, target);
    definitionMeta.properties = [];
    for (const metaData of metaDatas) {
      this.debugLogger(`  inject properties => [${Object.keys(metaData)}]`);
      for (const metaKey in metaData) {
        for (const propertyMeta of metaData[metaKey]) {
          definitionMeta.properties.push({
            metaKey,
            args: propertyMeta.args,
            value: propertyMeta.value,
          });
        }
      }
    }

    this.convertOptionsToDefinition(options, definitionMeta);
    // 对象自定义的annotations可以覆盖默认的属性
    this.registerCustomBinding(definitionMeta, target);

    // 把源信息变成真正的对象定义
    this.restoreDefinition(definitionMeta);
  }

  restoreDefinition(definitionMeta: IObjectDefinitionMetadata) {
    let definition;
    if (definitionMeta.definitionType === 'object') {
      definition = new ObjectDefinition();
    } else {
      definition = new FunctionDefinition();
      if (!definitionMeta.asynchronous) {
        definition.asynchronous = false;
      }
    }

    definition.path = definitionMeta.path;
    definition.id = definitionMeta.id;
    definition.srcPath = definitionMeta.srcPath;
    definition.namespace = definitionMeta.namespace;

    this.debugLogger(`  bind id => [${definition.id}]`);

    // inject constructArgs
    if (
      definitionMeta.constructorArgs &&
      definitionMeta.constructorArgs.length
    ) {
      for (const constructorInfo of definitionMeta.constructorArgs) {
        if (constructorInfo.type === 'ref') {
          const refManagedIns = new ManagedReference();
          const name = constructorInfo.value;
          refManagedIns.args = constructorInfo.args;
          if (this.midwayIdentifiers.includes(name)) {
            refManagedIns.name = name;
          } else {
            refManagedIns.name = generateProvideId(name, definition.namespace);
          }
          definition.constructorArgs.push(refManagedIns);
        } else {
          // inject empty value
          const valueManagedIns = new ManagedValue();
          valueManagedIns.valueType = constructorInfo.type;
          valueManagedIns.value = constructorInfo.value;
          definition.constructorArgs.push(valueManagedIns);
        }
      }
    }

    // inject properties
    for (const propertyMeta of definitionMeta.properties) {
      const refManaged = new ManagedReference();
      refManaged.args = propertyMeta.args;
      if (this.midwayIdentifiers.includes(propertyMeta.value)) {
        refManaged.name = propertyMeta.value;
      } else {
        refManaged.name = generateProvideId(
          propertyMeta.value,
          definition.namespace
        );
      }
      definition.properties.set(propertyMeta.metaKey, refManaged);
    }

    definition.asynchronous = definitionMeta.asynchronous;
    definition.initMethod = definitionMeta.initMethod;
    definition.destroyMethod = definitionMeta.destroyMethod;
    definition.scope = definitionMeta.scope;
    definition.autowire = definitionMeta.autowire;

    this.registerDefinition(definitionMeta.id, definition);
  }

  restoreDefinitions(definitionMetadataList) {
    if (definitionMetadataList && definitionMetadataList.length) {
      for (const definitionMeta of definitionMetadataList) {
        this.restoreDefinition(definitionMeta);
      }
    }
  }

  getDefinitionMetaList() {
    return this.definitionMetadataList;
  }

  protected registerCustomBinding(
    objectDefinition: IObjectDefinitionMetadata,
    target: any
  ) {
    // @async, @init, @destroy @scope
    const objDefOptions: ObjectDefinitionOptions = getObjectDefProps(target);
    this.convertOptionsToDefinition(objDefOptions, objectDefinition);
  }

  private convertOptionsToDefinition(
    options: ObjectDefinitionOptions,
    definition: IObjectDefinitionMetadata
  ) {
    if (options) {
      if (options.isAsync) {
        this.debugLogger('  register isAsync = true');
        definition.asynchronous = true;
      }

      if (options.initMethod) {
        this.debugLogger(`  register initMethod = ${options.initMethod}`);
        definition.initMethod = options.initMethod;
      }

      if (options.destroyMethod) {
        this.debugLogger(`  register destroyMethod = ${options.destroyMethod}`);
        definition.destroyMethod = options.destroyMethod;
      }

      if (options.scope) {
        this.debugLogger(`  register scope = ${options.scope}`);
        definition.scope = options.scope;
      }

      if (options.constructorArgs) {
        this.debugLogger(
          `  register constructorArgs = ${options.constructorArgs}`
        );
        definition.constructorArgs = options.constructorArgs;
      }

      if (options.isAutowire === false) {
        this.debugLogger(`  register autowire = ${options.isAutowire}`);
        definition.autowire = false;
      } else if (options.isAutowire === true) {
        this.debugLogger(`  register autowire = ${options.isAutowire}`);
        definition.autowire = true;
      }
    }
  }

  createChild(baseDir?: string): IContainer {
    return new Container(baseDir || this.baseDir, this);
  }

  resolve<T>(target: T): T {
    const tempContainer = new Container();
    tempContainer.bind<T>(target);
    tempContainer.parent = this;
    return tempContainer.get<T>(target);
  }

  get<T>(identifier: any, args?: any): T {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    return super.get(identifier, args);
  }

  async getAsync<T>(identifier: any, args?: any): Promise<T> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    return super.getAsync<T>(identifier, args);
  }

  protected getIdentifier(target: any) {
    return getProviderId(target);
  }
}
