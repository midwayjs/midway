import 'reflect-metadata';
import {IContainer, ObjectDefinitionOptions, ObjectIdentifier} from '../interfaces';
import {OBJ_DEF_CLS, ObjectDefinition, TAGGED, TAGGED_CLS, TAGGED_PROP} from '..';
import {ManagedReference, ManagedValue} from './common/managed';
import {FunctionDefinition} from '../base/FunctionDefinition';
import {ScopeEnum} from '../base/Scope';
import { XmlApplicationContext } from './xml/XmlApplicationContext';
import { Autowire } from '../../../midway-core/node_modules/injection/src/factory/common/Autowire';

const uuidv1 = require('uuid/v1');
const is = require('is-type-of');
const camelcase = require('camelcase');

export class Container extends XmlApplicationContext implements IContainer {
  protected id: string = uuidv1();

  init(): void {
    super.init();

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
          const refManaged = new ManagedReference();
          refManaged.name = propertyMeta.value;
          definition.properties.set(metaKey, refManaged);
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

  createChild(baseDir?: string): IContainer {
    return new Container(baseDir || this.baseDir, this);
  }

  protected registerObjectPropertyParser() {
    this.afterEachCreated((instance, context) => {
      Autowire.patchNoDollar(instance, context);
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
