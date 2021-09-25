import { MidwayContainer } from './container';
import { REQUEST_CTX_KEY, IMidwayContainer } from '../interface';
import { PIPELINE_IDENTIFIER } from '@midwayjs/decorator';

export class MidwayRequestContainer extends MidwayContainer {
  private readonly applicationContext: IMidwayContainer;

  constructor(ctx, applicationContext: IMidwayContainer) {
    super(applicationContext);
    this.applicationContext = applicationContext;

    // update legacy relationship
    this.registry.setIdentifierRelation(
      this.applicationContext.registry.getIdentifierRelation()
    );

    this.ctx = ctx;
    // register ctx
    this.registerObject(REQUEST_CTX_KEY, ctx);

    if (ctx.logger) {
      // register contextLogger
      this.registerObject('logger', ctx.logger);
    }

    const resolverHandler = this.applicationContext.getResolverHandler();
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
      return this.findRegisterObject(identifier);
    }

    const definition =
      this.applicationContext.registry.getDefinition(identifier);
    if (definition) {
      if (
        definition.isRequestScope() ||
        definition.id === PIPELINE_IDENTIFIER
      ) {
        // create object from applicationContext definition for requestScope
        const ins = this.getManagedResolverFactory().create({
          definition,
          args,
        });
        return this.aspectService.wrapperAspectToInstance(ins);
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

    if (this.registry.hasObject(identifier)) {
      return this.findRegisterObject(identifier);
    }

    const definition =
      this.applicationContext.registry.getDefinition(identifier);
    if (definition) {
      if (
        definition.isRequestScope() ||
        definition.id === PIPELINE_IDENTIFIER
      ) {
        // create object from applicationContext definition for requestScope
        const ins = await this.getManagedResolverFactory().createAsync({
          definition,
          args,
        });
        return this.aspectService.wrapperAspectToInstance(ins);
      }
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }

  async ready() {
    // ignore other things
  }

  getContext() {
    return this.ctx;
  }
}
