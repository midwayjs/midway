import {
  Args,
  Context,
  GraphQLService,
  Info,
  Parent,
  Query,
  Resolver,
  Subscription,
} from '../src';
import { IMidwayContainer, Inject, Provide } from '@midwayjs/core';

@Provide()
class HelloService {
  async say() {
    return 'hello midway';
  }
}

@Resolver()
class HelloResolver {
  @Inject()
  helloService: HelloService;

  @Query('hello')
  async hello() {
    return await this.helloService.say();
  }

  @Query('echo')
  echo(
    @Parent('prefix') prefix: string,
    @Args('message') message: string,
    @Context('requestId') requestId: string,
    @Info('fieldName') fieldName: string
  ) {
    return `${prefix}:${message}:${requestId}:${fieldName}`;
  }

  @Subscription('count')
  async *count() {
    yield {
      count: 1,
    };
  }
}

describe('/test/index.test.ts', () => {
  it('should build resolver maps from decorated classes', async () => {
    const service = new GraphQLService();
    const requestContext = {
      getAsync: jest.fn(async target => {
        if (target === HelloResolver) {
          const resolver = new HelloResolver();
          resolver.helloService = new HelloService();
          return resolver;
        }
      }),
    } as unknown as IMidwayContainer;

    const resolvers = service.buildResolvers({}, requestContext);
    const result = await resolvers.Query.hello(
      undefined,
      {},
      { requestContext },
      {}
    );

    expect(result).toBe('hello midway');
    expect(requestContext.getAsync).toHaveBeenCalledWith(HelloResolver);
  });

  it('should inject decorated resolver method parameters', async () => {
    const service = new GraphQLService();
    const requestContext = {
      getAsync: jest.fn(async target => {
        if (target === HelloResolver) {
          return new HelloResolver();
        }
      }),
    } as unknown as IMidwayContainer;

    const resolvers = service.buildResolvers({}, requestContext);
    const result = await resolvers.Query.echo(
      { prefix: 'parent' },
      { message: 'args' },
      { requestContext, requestId: 'ctx' },
      { fieldName: 'echo' }
    );

    expect(result).toBe('parent:args:ctx:echo');
  });

  it('should build subscription resolver objects from decorated methods', async () => {
    const service = new GraphQLService();
    const requestContext = {
      getAsync: jest.fn(async target => {
        if (target === HelloResolver) {
          return new HelloResolver();
        }
      }),
    } as unknown as IMidwayContainer;

    const resolvers = service.buildResolvers({}, requestContext);
    const iterator = await resolvers.Subscription.count.subscribe(
      undefined,
      {},
      { requestContext },
      {}
    );
    const result = await iterator.next();

    expect(result.value).toEqual({
      count: 1,
    });
  });
});
