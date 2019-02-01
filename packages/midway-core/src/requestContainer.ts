import { MidwayHandlerKey } from './constants';
import { MidwayContainer } from './container';
import { ManagedValue, VALUE_TYPE } from 'injection';

export class MidwayRequestContainer extends MidwayContainer {

  applicationContext: MidwayContainer;
  ctx;

  constructor(applicationContext) {
    super();
    this.parent = applicationContext;
    this.applicationContext = applicationContext;
  }

  updateContext(ctx) {
    this.registry.clearAll();
    this.ctx = ctx;
    // register ctx
    this.registerObject('ctx', ctx);
    // register contextLogger
    this.registerObject('logger', ctx.logger);
  }

  registerEachCreatedHook() {
    // register handler for container
    this.registerDataHandler(MidwayHandlerKey.CONFIG, (key) => {
      return this.ctx.app.config[key];
    });

    this.registerDataHandler(MidwayHandlerKey.PLUGIN, (key) => {
      return this.ctx.app.pluginContext.get(key);
    });

    this.registerDataHandler(MidwayHandlerKey.LOGGER, (key) => {
      return this.ctx.app.getLogger(key);
    });

    super.registerEachCreatedHook();
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
      if (definition.creator.constructor.name === 'FunctionWrapperCreator') {
        const valueManagedIns = new ManagedValue(this, VALUE_TYPE.OBJECT);
        definition.constructorArgs = [valueManagedIns];
      }
      // create object from applicationContext definition for requestScope
      return this.resolverFactory.createAsync(definition, args);
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }
}
