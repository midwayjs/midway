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
      return this.resolverFactory.create(definition, args);
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
      return await this.resolverFactory.createAsync(definition, args);
    }

    if (this.parent) {
      return await this.parent.getAsync<T>(identifier, args);
    }
  }

  protected getDependencyMap() {
    for(let [key, value] of this.applicationContext.dependencyMap.entries()) {
      if(!this.dependencyMap.has(key)) {
        this.dependencyMap.set(key, value);
      }
    }
    return this.dependencyMap;
  }

}
