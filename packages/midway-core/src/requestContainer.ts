import { ManagedValue, VALUE_TYPE } from 'injection';
import { MidwayContainer } from './container';

export class MidwayRequestContainer extends MidwayContainer {

  applicationContext: MidwayContainer;
  ctx;

  constructor(applicationContext, ctx?) {
    super();
    this.parent = applicationContext;
    this.applicationContext = applicationContext;

    if (ctx) {
      this.updateContext(ctx);
    }
  }

  updateContext(ctx) {
    // this.registry.clearAll();
    this.ctx = ctx;
    // register ctx
    this.registerObject('ctx', ctx);
    // register contextLogger
    this.registerObject('logger', ctx.logger);
  }

  get<T = any>(identifier: any, args?: any): T {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }
    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition && definition.isRequestScope()) {
      // create object from applicationContext definition for requestScope
      return this.getManagedResolverFactory().create(definition, args);
    }

    if (this.parent) {
      return this.parent.get(identifier, args);
    }
  }

  async getAsync<T = any>(identifier: any, args?: any): Promise<T> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition && definition.isRequestScope()) {
      if (definition.creator.constructor.name === 'FunctionWrapperCreator') {
        const valueManagedIns = new ManagedValue(this, VALUE_TYPE.OBJECT);
        definition.constructorArgs = [valueManagedIns];
      }
      // create object from applicationContext definition for requestScope
      return this.getManagedResolverFactory().createAsync(definition, args);
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }
}
