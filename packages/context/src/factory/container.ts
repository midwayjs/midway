import 'reflect-metadata';
import {IContainer, ObjectDefinitionOptions, ObjectIdentifier} from '../interfaces';
import {BaseApplicationContext} from './ApplicationContext';
import {OBJ_DEF_CLS, ObjectDefinition, TAGGED, TAGGED_CLS, TAGGED_PROP} from '..';
import * as _ from 'lodash';
import {ManagedReference, ManagedValue} from './common/managed';
import {FunctionDefinition} from '../base/FunctionDefinition';
import {ScopeEnum} from '../base/Scope';

const uuidv1 = require('uuid/v1');
const is = require('is-type-of');
const camelcase = require('camelcase');

export class Container extends BaseApplicationContext implements IContainer {

  protected id: string = uuidv1();

  constructor() {
    super();
    this.registerObjectPropertyParser();
  }

  bind<T>(target: T, options?: ObjectDefinitionOptions): void ;
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

    // inject constructArgs
    let constructorMetaData = Reflect.getMetadata(TAGGED, target);
    if (constructorMetaData && target['length']) {
      for (let i = 0; i < target['length']; i++) {
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
    let metaData = Reflect.getMetadata(TAGGED_PROP, target);
    if (metaData) {
      for (let metaKey in metaData) {
        for (let propertyMeta of metaData[metaKey]) {
          definition.properties.set(metaKey, {
            type: 'ref',
            name: propertyMeta.value
          });
        }
      }
    }

    this.registerCustomBinding(definition, target);

    if (options) {
      if (options.isAsync) {
        definition.asynchronous = true;
      }

      if (options.initMethod) {
        definition.initMethod = options.initMethod;
      }

      if (options.destroyMethod) {
        definition.destroyMethod = options.destroyMethod;
      }
    }

    this.registry.registerDefinition(identifier, definition);
  }

  registerCustomBinding(objectDefinition: ObjectDefinition, target: any) {
    // @async, @init, @destroy
    let objDefOptions: ObjectDefinitionOptions = Reflect.getMetadata(OBJ_DEF_CLS, target);

    if (objDefOptions) {
      if (objDefOptions.isAsync) {
        objectDefinition.asynchronous = true;
      }

      if (objDefOptions.initMethod) {
        objectDefinition.initMethod = objDefOptions.initMethod;
      }

      if (objDefOptions.destroyMethod) {
        objectDefinition.destroyMethod = objDefOptions.destroyMethod;
      }

      if (objDefOptions.isSingleton !== undefined) {
        if (!objDefOptions.isSingleton) {
          objectDefinition.scope = ScopeEnum.Application;
        }
      }
    }
  }

  createChild(): IContainer {
    const child = new Container();
    child.parent = this;
    return child;
  }

  protected registerObjectPropertyParser() {
    this.afterEachCreated((instance, context) => {
      _.forOwn(instance, (v, k) => {
        // 遍历 this.xx = null; 这样的属性
        if (v === null && k[0] === '$') {
          Object.defineProperty(instance, k, {
            get: () => context.get(k.slice(1)),
            configurable: false,
            enumerable: true
          });
        }
      });
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
