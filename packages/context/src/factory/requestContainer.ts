import 'reflect-metadata';
import {Container} from './container';
import {IContainer, ObjectIdentifier} from '../interfaces';

export class RequestContainer extends Container {

  applicationContext: IContainer;

  constructor(ctx, applicationContext) {
    super();
    this.registerObject('ctx', ctx);
    this.parent = applicationContext;
    this.applicationContext = applicationContext;
  }

  async getAsync<T>(identifier: ObjectIdentifier, args?: any) {
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(identifier);
    if(definition && definition.isRequestScope()) {
      // create object from applicationContext definition for requestScope
      return await this.resolverFactory.createAsync(definition, args);
    }

    if (!definition && this.parent) {
      return await this.parent.getAsync<T>(identifier, args);
    }
  }

}
