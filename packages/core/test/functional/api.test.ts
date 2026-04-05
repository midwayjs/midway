import {
  ASYNC_CONTEXT_MANAGER_KEY,
  ASYNC_CONTEXT_KEY,
  clearAllModule,
  Controller,
  Get,
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  MidwayWebRouterService,
} from '../../src';
import {
  adaptRouteManifest,
  defineApi,
  useInject,
} from '../../src/functional';
import { join } from 'path';
import { ComponentConfigurationLoader } from '../../src/context/componentLoader';
import {
  ASYNC_ROOT_CONTEXT,
  AsyncLocalStorageContextManager,
} from '../../src/common/asyncContextManager';

describe('test/functional/api.test.ts', function () {
  beforeEach(() => {
    clearAllModule();
  });

  it('should register defineApi routes into web router metadata', async () => {
    defineApi('/users', api => ({
      getUser: api.get('/:id').handle(async ({ input }) => {
        return input.params;
      }),
    }));

    const collector = new MidwayWebRouterService();
    const routes = await collector.getFlattenRouterTable();

    expect(routes.length).toBe(1);
    expect(routes[0].prefix).toBe('/users');
    expect(routes[0].url).toBe('/:id');
    expect(routes[0].requestMethod).toBe('get');
    expect(routes[0].method).toBe('getUser');
    expect(routes[0].source).toBe('functional');
  });

  it('should not execute handler during route discovery', async () => {
    let called = 0;

    defineApi('/users', api => ({
      getUser: api.get('/:id').handle(async () => {
        called++;
        return null;
      }),
    }));

    const collector = new MidwayWebRouterService();
    await collector.getFlattenRouterTable();

    expect(called).toBe(0);
  });

  it('should throw duplicate route error for class and functional mixed mode', async () => {
    @Controller('/users')
    class UserController {
      @Get('/:id')
      async getUser() {
        return null;
      }
    }
    expect(UserController).toBeDefined();

    defineApi('/users', api => ({
      getUser: api.get('/:id').handle(async () => {
        return null;
      }),
    }));

    const collector = new MidwayWebRouterService();
    await expect(collector.getFlattenRouterTable()).rejects.toMatchObject({
      message: expect.stringContaining('Duplicate router'),
      payload: {
        code: 'MIDWAY_DUPLICATE_ROUTE',
        method: 'GET',
        fullPath: '/users/:id',
        existing: {
          source: 'decorator',
          handler: expect.any(String),
        },
        current: {
          source: 'functional',
          handler: expect.any(String),
        },
      },
    });
  });

  it('should not throw duplicate route error when same functional api is evaluated twice', async () => {
    const register = () =>
      defineApi('/users', api => ({
        getUser: api.get('/:id').handle(async () => {
          return null;
        }),
      }));

    register();
    register();

    const collector = new MidwayWebRouterService();
    const routes = await collector.getFlattenRouterTable();
    const functionalRoutes = routes.filter(route => route.source === 'functional');
    expect(functionalRoutes).toHaveLength(1);
    expect(functionalRoutes[0].fullUrl).toBe('/users/:id');
  });

  it('should validate input schema at invoke time', async () => {
    const inputSchema = {
      parse(value) {
        if (!value || !value.id) {
          throw new Error('id is required');
        }
        return value;
      },
    };

    defineApi('/users', api => ({
      getUser: api
        .get('/:id')
        .input({
          params: inputSchema as any,
        })
        .handle(async ({ input }) => {
          return input.params;
        }),
    }));

    const collector = new MidwayWebRouterService();
    const routes = await collector.getFlattenRouterTable();
    const route = routes[0];
    const controller = new (route.controllerClz as any)();

    await expect(controller[route.method as string]({ params: {} })).rejects.toThrow(
      'Functional API input.params validation failed'
    );
  });

  it('should infer input schema type in handler', async () => {
    const paramsSchema = {
      parse(value: any): { id: string } {
        return value;
      },
    };

    defineApi('/users', api => ({
      getUser: api
        .get('/:id')
        .input({
          params: paramsSchema,
        })
        .handle(async ({ input }) => {
          const id: string = input.params.id;
          return { id };
        }),
    }));

    expect(true).toBe(true);
  });

  it('should validate output schema at invoke time', async () => {
    const outputSchema = {
      parse(value) {
        if (!value || !value.ok) {
          throw new Error('ok is required');
        }
        return value;
      },
    };

    defineApi('/users', api => ({
      getUser: api
        .get('/:id')
        .output(outputSchema as any)
        .handle(async () => {
          return {};
        }),
    }));

    const collector = new MidwayWebRouterService();
    const routes = await collector.getFlattenRouterTable();
    const route = routes[0];
    const controller = new (route.controllerClz as any)();

    await expect(
      controller[route.method as string]({ params: { id: '1' } })
    ).rejects.toThrow('Functional API output validation failed');
  });

  it('should discover functional api by detector configuration', async () => {
    const baseDir = join(
      __dirname,
      '../fixtures/app-with-functional-api-detector/src'
    );
    const container = new MidwayContainer();
    container.bind(MidwayConfigService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', baseDir);
    container.registerObject('baseDir', baseDir);

    const loader = new ComponentConfigurationLoader(container as any);
    await loader.load(require(join(baseDir, 'configuration.ts')));

    const collector = new MidwayWebRouterService();
    const routes = await collector.getFlattenRouterTable();
    expect(
      routes.some(
        route => route.prefix === '/detector' && route.url === '/ping'
      )
    ).toBe(true);
  });

  it('should discover functional api by entry import', async () => {
    const baseDir = join(__dirname, '../fixtures/app-with-functional-api-entry/src');
    const container = new MidwayContainer();
    container.bind(MidwayConfigService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', baseDir);
    container.registerObject('baseDir', baseDir);

    const loader = new ComponentConfigurationLoader(container as any);
    await loader.load(require(join(baseDir, 'configuration.ts')));

    const collector = new MidwayWebRouterService();
    const routes = await collector.getFlattenRouterTable();
    expect(
      routes.some(route => route.prefix === '/entry' && route.url === '/ping')
    ).toBe(true);
  });

  it('should respect route ignoreGlobalPrefix option', async () => {
    defineApi('/users', api => ({
      ping: api
        .get('/ping')
        .meta({
          ignoreGlobalPrefix: true,
        })
        .handle(async () => 'pong'),
    }));

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const routes = await collector.getFlattenRouterTable();
    expect(routes[0].prefix).toBe('/users');
    expect(routes[0].fullUrl).toBe('/users/ping');
  });

  it('should export route manifest with source and path', async () => {
    defineApi('/users', api => ({
      ping: api.get('/ping').handle(async () => 'pong'),
    }));

    const collector = new MidwayWebRouterService();
    const manifest = await collector.getRouteManifest();

    expect(manifest[0].source).toBe('functional');
    expect(manifest[0].operationId).toBe('get_users_ping');
    expect(manifest[0].controllerPrefix).toBe('/users');
    expect(manifest[0].path).toBe('/ping');
    expect(manifest[0].fullPath).toBe('/users/ping');
  });

  it('should use routerName as operationId in route manifest', async () => {
    defineApi('/users', api => ({
      ping: api
        .get('/ping')
        .meta({
          routerName: 'getUser',
        })
        .handle(async () => 'pong'),
    }));

    const collector = new MidwayWebRouterService();
    const manifest = await collector.getRouteManifest();
    expect(manifest[0].operationId).toBe('getUser');
  });

  it('should throw when operationId is duplicated', async () => {
    defineApi('/users', api => ({
      ping: api
        .get('/ping')
        .meta({
          routerName: 'sameOp',
        })
        .handle(async () => 'pong'),
      pong: api
        .post('/pong')
        .meta({
          routerName: 'sameOp',
        })
        .handle(async () => 'pong'),
    }));

    const collector = new MidwayWebRouterService();
    await expect(collector.getRouteManifest()).rejects.toThrow(
      'Duplicate operationId "sameOp"'
    );
  });

  it('should allow route ignoreGlobalPrefix=false override controller default true', async () => {
    defineApi(
      '/users',
      api => ({
        ping: api
          .get('/ping')
          .meta({
            ignoreGlobalPrefix: false,
          })
          .handle(async () => 'pong'),
      }),
      {
        ignoreGlobalPrefix: true,
      }
    );

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const routes = await collector.getFlattenRouterTable();
    expect(routes[0].prefix).toBe('/api/users');
    expect(routes[0].fullUrl).toBe('/api/users/ping');
  });

  it('should inherit controller ignoreGlobalPrefix when route option is not set', async () => {
    defineApi(
      '/users',
      api => ({
        ping: api.get('/ping').handle(async () => 'pong'),
      }),
      {
        ignoreGlobalPrefix: true,
      }
    );

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const routes = await collector.getFlattenRouterTable();
    expect(routes[0].prefix).toBe('/users');
    expect(routes[0].fullUrl).toBe('/users/ping');
  });

  it('should build fullPath with global prefix and version prefix', async () => {
    defineApi(
      '/users',
      api => ({
        ping: api.get('/ping').handle(async () => 'pong'),
      }),
      {
        version: '1',
        versionType: 'URI',
        versionPrefix: 'v',
      }
    );

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const routes = await collector.getFlattenRouterTable();
    expect(routes[0].prefix).toBe('/api/v1/users');
    expect(routes[0].fullUrl).toBe('/api/v1/users/ping');
  });

  it('should expose version fields in route manifest', async () => {
    defineApi(
      '/users',
      api => ({
        ping: api.get('/ping').handle(async () => 'pong'),
      }),
      {
        version: ['2', '3'],
        versionType: 'URI',
        versionPrefix: 'ver',
      }
    );

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const manifest = await collector.getRouteManifest();
    expect(manifest[0].fullPath).toBe('/api/ver2/users/ping');
    expect(manifest[0].version).toEqual(['2', '3']);
    expect(manifest[0].versionType).toBe('URI');
    expect(manifest[0].versionPrefix).toBe('ver');
  });

  it('should use URI/v as default version behavior when version is set', async () => {
    defineApi(
      '/users',
      api => ({
        ping: api.get('/ping').handle(async () => 'pong'),
      }),
      {
        version: '1',
      }
    );

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const routes = await collector.getFlattenRouterTable();
    expect(routes[0].prefix).toBe('/api/v1/users');
    expect(routes[0].fullUrl).toBe('/api/v1/users/ping');
    expect(routes[0].version).toBe('1');
    expect(routes[0].versionType).toBe('URI');
    expect(routes[0].versionPrefix).toBe('v');

    const manifest = await collector.getRouteManifest();
    expect(manifest[0].version).toBe('1');
    expect(manifest[0].versionType).toBe('URI');
    expect(manifest[0].versionPrefix).toBe('v');
    expect(manifest[0].fullPath).toBe('/api/v1/users/ping');
  });

  it('should support useInject in functional handler', async () => {
    const manager = new AsyncLocalStorageContextManager().enable();
    const appContextBackup = global['MIDWAY_APPLICATION_CONTEXT'];
    try {
      global['MIDWAY_APPLICATION_CONTEXT'] = {
        get(key: string) {
          if (key === ASYNC_CONTEXT_MANAGER_KEY) {
            return manager;
          }
          return undefined;
        },
      } as any;

      const userService = {
        async find(id: string) {
          return { id, name: 'harry' };
        },
      };

      const requestContext = {
        getAsync: jest.fn().mockResolvedValue(userService),
      };
      const mockCtx = {
        requestContext,
      };
      const asyncContext = ASYNC_ROOT_CONTEXT.setValue(
        ASYNC_CONTEXT_KEY,
        mockCtx
      );

      defineApi('/users', api => ({
        getUser: api.get('/:id').handle(async ({ input }) => {
          const service = await useInject<{ find(id: string): Promise<any> }>(
            'userService'
          );
          return service.find(input.params['id']);
        }),
      }));

      const collector = new MidwayWebRouterService();
      const routes = await collector.getFlattenRouterTable();
      const route = routes[0];
      const controller = new (route.controllerClz as any)();

      const result = await manager.with(asyncContext, async () => {
        return controller[route.method as string]({
          params: {
            id: '1',
          },
        });
      });

      expect(requestContext.getAsync).toHaveBeenCalledWith(
        'userService',
        undefined
      );
      expect(result).toEqual({
        id: '1',
        name: 'harry',
      });
    } finally {
      global['MIDWAY_APPLICATION_CONTEXT'] = appContextBackup;
    }
  });

  it('should adapt route manifest by adapter contract', async () => {
    defineApi('/users', api => ({
      getUser: api.get('/:id').handle(async () => {
        return null;
      }),
    }));

    const collector = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const manifest = await collector.getRouteManifest();
    const routes = adaptRouteManifest(manifest, items => {
      return items.map(item => ({
        method: item.method.toUpperCase(),
        path: item.fullPath,
      }));
    });

    expect(routes).toEqual([
      {
        method: 'GET',
        path: '/api/users/:id',
      },
    ]);
  });

});
