import {
  IManagedInstance,
  ObjectIdentifier,
  ScopeEnum,
} from '@midwayjs/decorator';
import {
  IProperties,
  IObjectCreator,
  IObjectDefinition,
  IMidwayContainer,
  HandlerProp,
} from '../interface';
import { ObjectCreator } from './objectCreator';

class FunctionWrapperCreator extends ObjectCreator {
  doConstruct(Clzz: any, args?: any, context?: IMidwayContainer): any {
    if (!Clzz) {
      return null;
    }
    return Clzz(context, args);
  }

  async doConstructAsync(
    Clzz: any,
    args?: any,
    context?: IMidwayContainer
  ): Promise<any> {
    if (!Clzz) {
      return null;
    }

    return Clzz(context, args);
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
  handlerProps: HandlerProp[] = [];
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
