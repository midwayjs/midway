import 'reflect-metadata';
import { Container } from './container';
import { IContainer } from '../interfaces';

export class RequestContainer extends Container {

  applicationContext: IContainer;

  constructor(ctx, applicationContext) {
    super();
    this.registerObject('ctx', ctx);
    this.parent = applicationContext;
    this.applicationContext = applicationContext;
  }

  get<T>(identifier: any, args?: any) {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }
    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition && definition.isRequestScope()) {
      // create object from applicationContext definition for requestScope
      const obj = this.resolverFactory.create(definition, args);
      this.attachDependencyMap();
      return obj;
    }

    if (this.parent) {
      return this.parent.get(identifier, args);
    }
  }

  async getAsync<T>(identifier: any, args?: any) {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition && definition.isRequestScope()) {
      // create object from applicationContext definition for requestScope
      const obj = await this.resolverFactory.createAsync(definition, args);
      this.attachDependencyMap();
      return obj;
    }

    if (this.parent) {
      return await this.parent.getAsync<T>(identifier, args);
    }
  }

  protected attachDependencyMap() {
    for(let [key, value] of this.dependencyMap.entries()) {
      if(!this.applicationContext.dependencyMap.has(key)) {
        this.applicationContext.dependencyMap.set(key, value);
      }
    }
  }

}
