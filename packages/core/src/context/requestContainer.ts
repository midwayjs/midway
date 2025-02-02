import {
  ClassType,
  IMidwayGlobalContainer,
  IMidwayRequestContainer,
  ObjectIdentifier,
  ScopeEnum,
} from '../interface';
import { REQUEST_CTX_KEY, REQUEST_CTX_UNIQUE_KEY } from '../constants';
import { ObjectDefinitionRegistry } from './definitionRegistry';

export class MidwayRequestContainer implements IMidwayRequestContainer {
  public parent: IMidwayGlobalContainer;
  public registry = new ObjectDefinitionRegistry();
  private attrMap: Map<string, any> = new Map();

  constructor(
    protected readonly ctx: any,
    protected readonly applicationContext: IMidwayGlobalContainer
  ) {
    this.parent = applicationContext;
    // update legacy relationship
    this.registry.setIdentifierRelation(
      this.applicationContext.registry.getIdentifierRelation()
    );
    // register ctx
    this.registerObject(REQUEST_CTX_KEY, ctx);
    // register res
    this.registerObject('res', {});

    if (ctx.logger) {
      // register contextLogger
      this.registerObject('logger', ctx.logger);
    }

    ctx[REQUEST_CTX_UNIQUE_KEY] = this;
  }

  get<T = any>(identifier: ClassType<T> | string, args?: any): T {
    return this.parent
      .getManagedResolverFactory()
      .create(identifier, args, this);
  }

  async getAsync<T = any>(
    identifier: ClassType<T> | string,
    args?: any
  ): Promise<T> {
    return this.parent
      .getManagedResolverFactory()
      .createAsync(identifier, args, this);
  }

  getContext() {
    return this.ctx;
  }

  hasDefinition(identifier: ObjectIdentifier): boolean {
    return this.parent.hasDefinition(identifier);
  }

  getDefinition(identifier: ObjectIdentifier) {
    return this.parent.getDefinition(identifier);
  }

  registerObject(identifier: string, obj: any) {
    this.registry.registerObject(identifier, obj);
  }

  removeObject(identifier: ObjectIdentifier) {
    this.registry.removeObject(identifier);
  }

  hasObject(identifier: ObjectIdentifier): boolean {
    return this.registry.hasObject(identifier);
  }

  getObject<T>(identifier: ObjectIdentifier): T {
    return this.registry.getObject(identifier);
  }

  setAttr(key: string, value: any): void {
    this.attrMap.set(key, value);
  }

  getAttr<T>(key: string): T {
    return this.attrMap.get(key);
  }

  getIdentifier(identifier: ClassType | string): string {
    return this.parent.getIdentifier(identifier);
  }

  getInstanceScope(instance: any): ScopeEnum | undefined {
    return this.parent.getInstanceScope(instance);
  }

  hasNamespace(namespace: string): boolean {
    return this.parent.hasNamespace(namespace);
  }
}
