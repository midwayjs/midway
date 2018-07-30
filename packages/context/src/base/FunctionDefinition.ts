import {ObjectCreator} from './ObjectCreator';
import {
  IApplicationContext,
  IConfiguration,
  IManagedInstance,
  IObjectCreator,
  IObjectDefinition,
  ObjectIdentifier
} from '../interfaces';

class FunctionWrapperCreator extends ObjectCreator {

  context;

  constructor(definition: IObjectDefinition, context: IApplicationContext) {
    super(definition);
    this.context = context;
  }

  doConstruct(Clzz: any, args?: any): any {
    if (!Clzz) {
      return null;
    }

    return Clzz(this.context);
  }

  async doConstructAsync(Clzz: any, args?: any): Promise<any> {
    if (!Clzz) {
      return null;
    }
    return await Clzz(this.context);
  }
}

export class FunctionDefinition implements IObjectDefinition {

  context;

  constructor(context: IApplicationContext) {
    this.context = context;
    this.creator = new FunctionWrapperCreator(this, context);
  }

  constructMethod: string;
  constructorArgs: IManagedInstance[] = [];
  creator: IObjectCreator;
  dependsOn: ObjectIdentifier[];
  destroyMethod: string;
  export: string;
  id: string;
  name: string;
  initMethod: string;
  path: any;
  properties: IConfiguration;

  getAttr(key: ObjectIdentifier): any {
  }

  hasAttr(key: ObjectIdentifier): boolean {
    return false;
  }

  hasConstructorArgs(): boolean {
    return false;
  }

  hasDependsOn(): boolean {
    return false;
  }

  isAsync(): boolean {
    return false;
  }

  isAutowire(): boolean {
    return false;
  }

  isDirect(): boolean {
    return false;
  }

  isExternal(): boolean {
    return false;
  }

  isRequestScope(): boolean {
    return false;
  }

  isSingletonScope(): boolean {
    return false;
  }

  setAttr(key: ObjectIdentifier, value: any): void {
  }
}
