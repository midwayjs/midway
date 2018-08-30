import { ObjectCreator } from './ObjectCreator';
import {
  IApplicationContext,
  IConfiguration,
  IManagedInstance,
  IObjectCreator,
  IObjectDefinition,
  ObjectIdentifier,
  Scope
} from '../interfaces';
import { ScopeEnum } from './Scope';
import { ManagedValue } from '..';

class FunctionWrapperCreator extends ObjectCreator {

  context;

  constructor(definition: IObjectDefinition, context: IApplicationContext) {
    super(definition);
    this.context = context;
  }

  doConstruct(Clzz: any, args: Array<IManagedInstance> = []): any {
    if (!Clzz) {
      return null;
    }

    if (args.length) {
      return Clzz((<ManagedValue>args[0]).value);
    } else {
      return Clzz(this.context);
    }
  }

  async doConstructAsync(Clzz: any, args: Array<IApplicationContext> = []): Promise<any> {
    if (!Clzz) {
      return null;
    }
    if (args.length) {
      return await Clzz(args[0]);
    } else {
      return await Clzz(this.context);
    }
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
  protected _scope: Scope = ScopeEnum.Singleton;

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
    return true;
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

  set scope(scope: Scope) {
    this._scope = scope;
  }

  isSingletonScope(): boolean {
    return this._scope === ScopeEnum.Singleton;
  }

  isRequestScope(): boolean {
    return this._scope === ScopeEnum.Request;
  }

  setAttr(key: ObjectIdentifier, value: any): void {
  }
}
