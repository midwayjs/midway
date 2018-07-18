import { ObjectIdentifier,
  Scope,
  IObjectDefinition,
  IObjectCreator
} from '../interfaces';
import { ScopeEnum } from './Scope';
import { ObjectConfiguration } from './Configuration';
import {ObjectCreator} from './ObjectCreator';

export class ObjectDefinition implements IObjectDefinition {
  protected _attrs = new Map<ObjectIdentifier, any>();
  protected _asynchronous: boolean = false;
  protected _autowire: boolean = false;
  protected _external: boolean = false;
  protected _direct: boolean = false;
  protected _scope: Scope = ScopeEnum.Singleton;
  creator: IObjectCreator = null;
  id: string = null;
  initMethod: string = null;
  destroyMethod: string = null;
  constructMethod: string = null;
  constructorArgs: any[] = [];
  path: any = null;
  export: string = null;
  dependsOn: ObjectIdentifier[] = [];
  properties = new ObjectConfiguration();

  constructor() {
    this.creator = new ObjectCreator(this);
  }

  set autowire(autowire: boolean) {
    this._autowire = autowire;
  }

  isAutowire(): boolean {
    return this._autowire;
  }

  set asynchronous(asynchronous: boolean) {
    this._asynchronous = asynchronous;
  }

  isAsync(): boolean {
    return this._asynchronous;
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

  set external(external: boolean) {
    this._external = external;
  }

  isExternal(): boolean {
    return this._external;
  }

  set direct(direct: boolean) {
    this._direct = direct;
  }

  isDirect(): boolean {
    return this._direct;
  }

  hasDependsOn(): boolean {
    return this.dependsOn.length > 0;
  }

  hasConstructorArgs(): boolean {
    return this.constructorArgs.length > 0;
  }

  getAttr(key: ObjectIdentifier): any {
    return this._attrs.get(key);
  }

  hasAttr(key: ObjectIdentifier): boolean {
    return this._attrs.has(key);
  }

  setAttr(key: ObjectIdentifier, value: any): void {
    this._attrs.set(key, value);
  }
}


