import 'reflect-metadata';
import { IContainer, ObjectDefinitionOptions, ObjectIdentifier } from '../interfaces';
import { OBJ_DEF_CLS, ObjectDefinition, TAGGED, TAGGED_CLS, TAGGED_PROP } from '..';
import { ManagedReference, ManagedValue } from './common/managed';
import { FunctionDefinition } from '../base/FunctionDefinition';
import { XmlApplicationContext } from './xml/XmlApplicationContext';
import { recursiveGetMetadata } from '../utils/reflectTool';
import { Autowire } from './common/Autowire';

const uuidv1 = require('uuid/v1');
const is = require('is-type-of');
const camelcase = require('camelcase');
const debug = require('debug')(`injection:Container:${process.pid}`);

export class Container extends XmlApplicationContext implements IContainer {
  id: string = uuidv1();

  init(): void {
    super.init();
    this.registerObjectPropertyParser();
  }

  bind<T>(target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(identifier: ObjectIdentifier, target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(identifier: ObjectIdentifier, target: T, options?: ObjectDefinitionOptions): void {
    let definition;
    // definition.autowire = true;
    if (is.class(identifier) || is.function(identifier)) {
      options = target;
      target = <any>identifier;
      identifier = this.getIdentifier(target);
      options = null;
    }

    if (is.class(target)) {
      definition = new ObjectDefinition();
    } else {
      definition = new FunctionDefinition(this);
    }

    definition.path = target;
    definition.id = identifier;

    debug(`=> bind and build definition, id = [${definition.id}]`);

    // inject constructArgs
    let constructorMetaData = Reflect.getMetadata(TAGGED, target);
    if (constructorMetaData) {
      debug(`   register inject constructor length = ${target['length']}`);
      const maxLength = Math.max.apply(null, Object.keys(constructorMetaData));
      for (let i = 0; i < maxLength + 1; i++) {
        const propertyMeta = constructorMetaData[i];
        if (propertyMeta) {
          const refManagedIns = new ManagedReference();
          refManagedIns.name = propertyMeta[0].value;
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
    let metaDatas = recursiveGetMetadata(TAGGED_PROP, target);
    for (const metaData of metaDatas) {
      debug(`   register inject properties = [${Object.keys(metaData)}]`);
      for (let metaKey in metaData) {
        for (let propertyMeta of metaData[metaKey]) {
          const refManaged = new ManagedReference();
          refManaged.name = propertyMeta.value;
          definition.properties.set(metaKey, refManaged);
        }
      }
    }

    this.convertOptionsToDefinition(options, definition);
    // 对象自定义的annotations可以覆盖默认的属性
    this.registerCustomBinding(definition, target);

    this.registerDefinition(identifier, definition);
    debug(`   bind and build definition complete, id = [${definition.id}]`);
  }

  registerCustomBinding(objectDefinition: ObjectDefinition, target: any) {
    // @async, @init, @destroy @scope
    let objDefOptions: ObjectDefinitionOptions = Reflect.getMetadata(OBJ_DEF_CLS, target);

    this.convertOptionsToDefinition(objDefOptions, objectDefinition);
  }

  private convertOptionsToDefinition(options: ObjectDefinitionOptions, definition: ObjectDefinition): ObjectDefinition {
    if (options) {
      if (options.isAsync) {
        debug(`   register isAsync = true`);
        definition.asynchronous = true;
      }

      if (options.initMethod) {
        debug(`   register initMethod = ${definition.initMethod}`);
        definition.initMethod = options.initMethod;
      }

      if (options.destroyMethod) {
        debug(`   register destroyMethod = ${definition.destroyMethod}`);
        definition.destroyMethod = options.destroyMethod;
      }

      if (options.scope) {
        debug(`   register scope = ${definition.scope}`);
        definition.scope = options.scope;
      }

      if (options.constructorArgs) {
        debug(`   register constructorArgs = ${options.constructorArgs}`);
        definition.constructorArgs = options.constructorArgs;
      }

      if (options.isAutowire === false) {
        debug(`   register autowire = ${options.isAutowire}`);
        definition.autowire = false;
      } else if (options.isAutowire === true) {
        debug(`   register autowire = ${options.isAutowire}`);
        definition.autowire = true;
      }
    }

    return definition;
  }

  createChild(baseDir?: string): IContainer {
    return new Container(baseDir || this.baseDir, this);
  }

  protected registerObjectPropertyParser() {
    this.afterEachCreated((instance, context, definition) => {
      if (definition.isAutowire()) {
        Autowire.patchNoDollar(instance, context);
      }
    });
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
    return await super.getAsync<T>(identifier, args);
  }

  protected getIdentifier(target: any) {
    const metaData = Reflect.getOwnMetadata(TAGGED_CLS, target);
    if (metaData) {
      return metaData.id;
    } else {
      return camelcase(target.name);
    }
  }
}
