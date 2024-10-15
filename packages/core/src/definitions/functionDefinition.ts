import {
  IProperties,
  IObjectCreator,
  IObjectDefinition,
  IManagedInstance,
  ObjectIdentifier,
  ScopeEnum,
  IMidwayContainer
} from '../interface';
import { ObjectCreator } from './objectCreator';

class FunctionWrapperCreator extends ObjectCreator {
  type = 'function';
  doConstruct(Clzz: any, args?: any[]): any {
    return Clzz;
  }

  doInit(obj: any, context: IMidwayContainer): any {
    return obj(context);
  }

  async doInitAsync(obj: any, context: IMidwayContainer): Promise<void> {
    return obj(context);
  }
}

export class FunctionDefinition implements IObjectDefinition {
  constructor() {
    this.creator = new FunctionWrapperCreator(this);
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
  srcPath: string;
  path: any;
  properties: IProperties;
  namespace = '';
  asynchronous = true;
  handlerProps = [];
  createFrom;
  allowDowngrade = false;
  // 函数工厂创建的对象默认不需要自动装配
  protected innerAutowire = false;
  protected innerScope: ScopeEnum = ScopeEnum.Singleton;

  getAttr(key: ObjectIdentifier): any {}

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
    return this.asynchronous;
  }

  isDirect(): boolean {
    return false;
  }

  isExternal(): boolean {
    return false;
  }

  set scope(scope: ScopeEnum) {
    this.innerScope = scope;
  }

  isSingletonScope(): boolean {
    return this.innerScope === ScopeEnum.Singleton;
  }

  isRequestScope(): boolean {
    return this.innerScope === ScopeEnum.Request;
  }

  setAttr(key: ObjectIdentifier, value: any): void {}
}
