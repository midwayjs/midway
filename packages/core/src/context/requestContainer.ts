import { MidwayContainer } from './midwayContainer';
import { REQUEST_CTX_KEY } from '../interface';
import { parsePrefix } from '../common/util';
import { PIPELINE_IDENTIFIER } from '@midwayjs/decorator';

export class MidwayRequestContainer extends MidwayContainer {
  private applicationContext: MidwayContainer;

  constructor(ctx, applicationContext) {
    super();
    this.parent = applicationContext;
    this.applicationContext = applicationContext;
    // register ctx
    this.registerObject(REQUEST_CTX_KEY, ctx);

    if (ctx.logger) {
      // register contextLogger
      this.registerObject('logger', ctx.logger);
    }

    const resolverHandler = this.applicationContext.resolverHandler;
    this.beforeEachCreated(
      resolverHandler.beforeEachCreated.bind(resolverHandler)
    );
    this.afterEachCreated(
      resolverHandler.afterEachCreated.bind(resolverHandler)
    );
  }

  init() {
    // do nothing
  }

  get<T = any>(identifier: any, args?: any): T {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }
    const definition = this.applicationContext.registry.getDefinition(
      identifier
    );
    if (definition) {
      if (
        definition.isRequestScope() ||
        definition.id === PIPELINE_IDENTIFIER
      ) {
        // create object from applicationContext definition for requestScope
        return this.getManagedResolverFactory().create({
          definition,
          args,
        });
      }
    }

    if (this.parent) {
      return this.parent.get(identifier, args);
    }
  }

  async getAsync<T = any>(identifier: any, args?: any): Promise<T> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }

    identifier = parsePrefix(identifier);

    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(
      identifier
    );
    if (definition) {
      if (
        definition.isRequestScope() ||
        definition.id === PIPELINE_IDENTIFIER
      ) {
        // create object from applicationContext definition for requestScope
        return this.getManagedResolverFactory().createAsync({
          definition,
          args,
        });
      }
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }

  async ready() {
    this.readied = true;
    // ignore other things
  }

  get configService() {
    return this.applicationContext.configService;
  }

  get environmentService() {
    return this.applicationContext.environmentService;
  }
}
