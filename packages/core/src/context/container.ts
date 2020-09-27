import 'reflect-metadata';
import {
  ObjectDefinitionOptions,
  ObjectIdentifier,
  getConstructorInject,
  getObjectDefProps,
  TAGGED_PROP,
  getProviderId,
} from '@midwayjs/decorator';
import { IContainer } from '../interface';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { ManagedReference, ManagedValue } from './managed';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { BaseApplicationContext } from './applicationContext';
import { recursiveGetMetadata } from '../common/reflectTool';
import { generateProvideId } from '../common/util';
import { isAsyncFunction, isClass, isFunction } from '../util';

const globalDebugLogger = require('debug')(`midway:container`);

export class Container extends BaseApplicationContext implements IContainer {
  debugLogger = globalDebugLogger;
  // 自己内部实现的，可注入的 feature(见 features)
  protected midwayIdentifiers: string[] = [];
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
    let definition;

    if (isClass(identifier) || isFunction(identifier)) {
      options = target;
      target = identifier as any;
      identifier = this.getIdentifier(target);
      options = null;
    }

    if (isClass(target)) {
      definition = new ObjectDefinition();
    } else {
      definition = new FunctionDefinition();
      if (!isAsyncFunction(target)) {
        definition.asynchronous = false;
      }
    }

    definition.path = target;
    definition.id = identifier;
    definition.srcPath = options ? options.srcPath : null;
    definition.namespace = options ? options.namespace : '';

    this.debugLogger(`  bind id => [${definition.id}]`);

    // inject constructArgs
    const constructorMetaData = getConstructorInject(target);
    if (constructorMetaData) {
      this.debugLogger(`inject constructor => length = ${target['length']}`);
      const maxLength = Math.max.apply(null, Object.keys(constructorMetaData));
      for (let i = 0; i < maxLength + 1; i++) {
        const propertyMeta = constructorMetaData[i];
        if (propertyMeta) {
          const refManagedIns = new ManagedReference();
          const name = propertyMeta[0].value;
          refManagedIns.args = propertyMeta[0].args;
          if (this.midwayIdentifiers.includes(name)) {
            refManagedIns.name = name;
          } else {
            refManagedIns.name = generateProvideId(name, definition.namespace);
          }
          definition.constructorArgs.push(refManagedIns);
        } else {
          // inject empty value
          const valueManagedIns = new ManagedValue();
          valueManagedIns.value = undefined;
          definition.constructorArgs.push(valueManagedIns);
        }
      }
    }

    // inject properties
    const metaDatas = recursiveGetMetadata(TAGGED_PROP, target);
    for (const metaData of metaDatas) {
      this.debugLogger(`  inject properties => [${Object.keys(metaData)}]`);
      for (const metaKey in metaData) {
        for (const propertyMeta of metaData[metaKey]) {
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
          definition.properties.set(metaKey, refManaged);
        }
      }
    }

    this.convertOptionsToDefinition(options, definition);
    // 对象自定义的annotations可以覆盖默认的属性
    this.registerCustomBinding(definition, target);

    this.registerDefinition(identifier, definition);
  }

  registerCustomBinding(objectDefinition: ObjectDefinition, target: any) {
    // @async, @init, @destroy @scope
    const objDefOptions: ObjectDefinitionOptions = getObjectDefProps(target);

    this.convertOptionsToDefinition(objDefOptions, objectDefinition);
  }

  private convertOptionsToDefinition(
    options: ObjectDefinitionOptions,
    definition: ObjectDefinition
  ): ObjectDefinition {
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

    return definition;
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
