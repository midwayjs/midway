import {
  Args,
  Context,
  GraphQLService,
  Info,
  Mutation,
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

  @Mutation('merge')
  merge(@Args() args) {
    return `${args.left}:${args.right}`;
  }

  @Subscription('count')
  async *count() {
    yield {
      count: 1,
    };
  }
}

class RawResolver {
  @Query()
  raw(parent, args, context, info) {
    return `${parent.name}:${args.id}:${context.requestId}:${info.fieldName}`;
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

  it('should inject full argument objects and use the fallback container', async () => {
    const service = new GraphQLService();
    const container = {
      getAsync: jest.fn(async target => {
        if (target === HelloResolver) {
          return new HelloResolver();
        }
      }),
    } as unknown as IMidwayContainer;

    const resolvers = service.buildResolvers({}, container);
    const result = await resolvers.Mutation.merge(
      undefined,
      {
        left: 'left',
        right: 'right',
      },
      {},
      {}
    );

    expect(result).toBe('left:right');
    expect(container.getAsync).toHaveBeenCalledWith(HelloResolver);
  });

  it('should support resolver classes without resolver metadata', async () => {
    const service = new GraphQLService();
    const container = {
      getAsync: jest.fn(async target => {
        if (target === RawResolver) {
          return new RawResolver();
        }
      }),
    } as unknown as IMidwayContainer;

    const resolvers = service.buildResolvers(
      {
        resolverClasses: [RawResolver],
      },
      container
    );
    const result = await resolvers.Query.raw(
      {
        name: 'parent',
      },
      {
        id: 'args',
      },
      {
        requestId: 'ctx',
      },
      {
        fieldName: 'raw',
      }
    );

    expect(result).toBe('parent:args:ctx:raw');
  });
});
