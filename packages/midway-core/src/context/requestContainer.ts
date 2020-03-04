import { MidwayContainer } from './midwayContainer';
import { REQUEST_CTX_KEY } from '../interface';
import { parsePrefix } from '../common/util';

export class MidwayRequestContainer extends MidwayContainer {

  applicationContext: MidwayContainer;

  constructor(ctx, applicationContext) {
    super();
    this.parent = applicationContext;
    this.applicationContext = applicationContext;
    // register ctx
    this.registerObject(REQUEST_CTX_KEY, ctx);
    // register contextLogger
    this.registerObject('logger', ctx.logger);
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
      return this.getManagedResolverFactory().create({ definition, args });
    }

    if (this.parent) {
      return this.parent.get(identifier, args);
    }
  }

  async getAsync<T>(identifier: any, args?: any) {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }

    identifier = parsePrefix(identifier);

    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition && definition.isRequestScope()) {
      // create object from applicationContext definition for requestScope
      return this.getManagedResolverFactory().createAsync({ definition, args });
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }

  initService() {
    // do nothing
  }
}
