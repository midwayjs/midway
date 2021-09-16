import { IObjectCreator, IObjectDefinition, HandlerProp } from '../interface';
import { ScopeEnum, ObjectIdentifier } from '@midwayjs/decorator';
import { ObjectProperties } from './properties';
import { ObjectCreator } from './objectCreator';

/* tslint:disable:variable-name */
export class ObjectDefinition implements IObjectDefinition {
  protected _attrs = new Map<ObjectIdentifier, any>();
  protected _asynchronous = false;
  scope: ScopeEnum = ScopeEnum.Singleton;
  creator: IObjectCreator = null;
  id: string = null;
  name: string = null;
  initMethod: string = null;
  destroyMethod: string = null;
  constructMethod: string = null;
  constructorArgs: any[] = [];
  srcPath: string;
  path: any = null;
  export: string = null;
  dependsOn: ObjectIdentifier[] = [];
  properties = new ObjectProperties();
  namespace = '';
  handlerProps: HandlerProp[] = [];

  constructor() {
    this.creator = new ObjectCreator(this);
  }

  set asynchronous(asynchronous: boolean) {
    this._asynchronous = asynchronous;
  }

  isAsync(): boolean {
    return this._asynchronous;
  }

  isSingletonScope(): boolean {
    return this.scope === ScopeEnum.Singleton;
  }

  isRequestScope(): boolean {
    return this.scope === ScopeEnum.Request;
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
/* tslint:enable:variable-name */
