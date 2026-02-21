import { createLightApp, close } from '@midwayjs/mock';
import {
  Catch,
  Configuration,
  Controller,
  Get,
  MainApp,
  MidwayWebRouterService,
  Post,
  Inject,
  makeHttpRequest,
  sleep,
  httpError,
} from '@midwayjs/core';
import {
  defineApi,
  FUNCTIONAL_API_CONTROLLER_CLASS_KEY,
} from '@midwayjs/core/functional';
import { createHttpRequest } from './utils';

type LightApp = any;

const koaComponent = require('../src');

async function createClassApp(
  preloadModules: any[],
  globalConfig: Record<string, any> = {}
) {
  return createLightApp('', {
    imports: [koaComponent],
    preloadModules,
    globalConfig: {
      keys: '123',
      ...globalConfig,
    },
  });
}

async function createFunctionalApp(
  setup: () => Array<Record<string, any>> | Record<string, any>,
  globalConfig: Record<string, any> = {},
  extraPreloadModules: any[] = []
) {
  const apiModules = [].concat(setup() as any).filter(Boolean);
  const preloadModules = apiModules
    .map(item => item[FUNCTIONAL_API_CONTROLLER_CLASS_KEY])
    .filter(Boolean);
  return createLightApp('', {
    imports: [koaComponent],
    preloadModules: [...preloadModules, ...extraPreloadModules],
    globalConfig: {
      keys: '123',
      ...globalConfig,
    },
  });
}

async function closeApps(...apps: LightApp[]) {
  for (const app of apps) {
    if (app) {
      await close(app);
    }
  }
}

describe('functional api parity with class decorators', () => {
  it('should keep basic GET/POST behavior consistent', async () => {
    @Controller('/parity/basic')
    class ClassController {
      @Get('/:id')
      async getUser(ctx) {
        return {
          id: ctx.params.id,
          name: ctx.query.name,
        };
      }

      @Post('/')
      async createUser(ctx) {
        return {
          name: ctx.request.body.name,
        };
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/basic', api => ({
        getUser: api.get('/:id').handle(async ({ input }) => {
          return {
            id: input.params['id'],
            name: input.query['name'],
          };
        }),
        createUser: api.post('/').handle(async ({ input }) => {
          return {
            name: input.body['name'],
          };
        }),
      }));
    });

    const classGet = await createHttpRequest(classApp)
      .get('/parity/basic/u-1')
      .query({
        name: 'harry',
      });
    const functionalGet = await createHttpRequest(functionalApp)
      .get('/parity/basic/u-1')
      .query({
        name: 'harry',
      });

    expect(functionalGet.status).toBe(classGet.status);
    expect(functionalGet.body).toEqual(classGet.body);

    const classPost = await createHttpRequest(classApp)
      .post('/parity/basic')
      .send({
        name: 'lucy',
      });
    const functionalPost = await createHttpRequest(functionalApp)
      .post('/parity/basic')
      .send({
        name: 'lucy',
      });

    expect(functionalPost.status).toBe(classPost.status);
    expect(functionalPost.body).toEqual(classPost.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep globalPrefix behavior consistent', async () => {
    @Controller('/parity/prefix')
    class ClassController {
      @Get('/ping')
      async ping() {
        return 'pong';
      }
    }

    const globalConfig = {
      globalPrefix: '/api',
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/prefix', api => ({
          ping: api.get('/ping').handle(async () => 'pong'),
        }));
      },
      globalConfig
    );

    const classPrefixed = await createHttpRequest(classApp).get(
      '/api/parity/prefix/ping'
    );
    const functionalPrefixed = await createHttpRequest(functionalApp).get(
      '/api/parity/prefix/ping'
    );
    expect(functionalPrefixed.status).toBe(classPrefixed.status);
    expect(functionalPrefixed.text).toBe(classPrefixed.text);

    const classWithoutPrefix = await createHttpRequest(classApp).get(
      '/parity/prefix/ping'
    );
    const functionalWithoutPrefix = await createHttpRequest(functionalApp).get(
      '/parity/prefix/ping'
    );
    expect(functionalWithoutPrefix.status).toBe(classWithoutPrefix.status);

    await closeApps(classApp, functionalApp);
  });

  it('should keep ignoreGlobalPrefix behavior consistent', async () => {
    @Controller('/parity/ignore', {
      ignoreGlobalPrefix: true,
    } as any)
    class ClassController {
      @Get('/ping')
      async ping() {
        return 'pong';
      }
    }

    const globalConfig = {
      globalPrefix: '/api',
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi(
          '/parity/ignore',
          api => ({
            ping: api.get('/ping').handle(async () => 'pong'),
          }),
          {
            ignoreGlobalPrefix: true,
          }
        );
      },
      globalConfig
    );

    const classWithoutPrefix = await createHttpRequest(classApp).get(
      '/parity/ignore/ping'
    );
    const functionalWithoutPrefix = await createHttpRequest(functionalApp).get(
      '/parity/ignore/ping'
    );
    expect(functionalWithoutPrefix.status).toBe(classWithoutPrefix.status);
    expect(functionalWithoutPrefix.text).toBe(classWithoutPrefix.text);

    const classPrefixed = await createHttpRequest(classApp).get(
      '/api/parity/ignore/ping'
    );
    const functionalPrefixed = await createHttpRequest(functionalApp).get(
      '/api/parity/ignore/ping'
    );
    expect(functionalPrefixed.status).toBe(classPrefixed.status);

    await closeApps(classApp, functionalApp);
  });

  it('should keep query parser behavior consistent for extended mode', async () => {
    @Controller('/parity/query')
    class ClassController {
      @Get('/value')
      async query(ctx) {
        return ctx.query;
      }
    }

    const globalConfig = {
      koa: {
        queryParseMode: 'extended',
      },
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/query', api => ({
          value: api.get('/value').handle(async ({ input }) => input.query),
        }));
      },
      globalConfig
    );

    const queryText = 'a=1&a=3&c[0]=1&c[1]=2';
    const classResult = await createHttpRequest(classApp).get(
      `/parity/query/value?${queryText}`
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      `/parity/query/value?${queryText}`
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.body).toEqual(classResult.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep query parser behavior consistent for strict mode', async () => {
    @Controller('/parity/query-strict')
    class ClassController {
      @Get('/value')
      async query(ctx) {
        return ctx.query;
      }
    }

    const globalConfig = {
      koa: {
        queryParseMode: 'strict',
      },
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/query-strict', api => ({
          value: api.get('/value').handle(async ({ input }) => input.query),
        }));
      },
      globalConfig
    );

    const queryText = 'a=1&b=2&a=3&c[0]=1&c[1]=2';
    const classResult = await createHttpRequest(classApp).get(
      `/parity/query-strict/value?${queryText}`
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      `/parity/query-strict/value?${queryText}`
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.body).toEqual(classResult.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep query parser behavior consistent for first mode', async () => {
    @Controller('/parity/query-first')
    class ClassController {
      @Get('/value')
      async query(ctx) {
        return ctx.query;
      }
    }

    const globalConfig = {
      koa: {
        queryParseMode: 'first',
      },
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/query-first', api => ({
          value: api.get('/value').handle(async ({ input }) => input.query),
        }));
      },
      globalConfig
    );

    const queryText = 'a=1&b=2&a=3&c[0]=1&c[1]=2';
    const classResult = await createHttpRequest(classApp).get(
      `/parity/query-first/value?${queryText}`
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      `/parity/query-first/value?${queryText}`
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.body).toEqual(classResult.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep route middleware behavior consistent', async () => {
    const middleware = [
      async (ctx, next) => {
        ctx.set('x-parity-mw', 'enabled');
        await next();
      },
    ];

    @Controller('/parity/middleware')
    class ClassController {
      @Get('/ping', {
        middleware: middleware as any,
      } as any)
      async ping() {
        return 'pong';
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/middleware', api => ({
        ping: api
          .get('/ping')
          .meta({
            middleware: middleware as any,
          })
          .handle(async () => 'pong'),
      }));
    });

    const classResult = await createHttpRequest(classApp).get(
      '/parity/middleware/ping'
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      '/parity/middleware/ping'
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.text).toBe(classResult.text);
    expect(functionalResult.headers['x-parity-mw']).toBe(
      classResult.headers['x-parity-mw']
    );

    await closeApps(classApp, functionalApp);
  });

  it('should keep URI versioning behavior consistent', async () => {
    @Controller('/parity/version', {
      version: '1',
      versionType: 'URI',
      versionPrefix: 'v',
    } as any)
    class ClassController {
      @Get('/ping')
      async ping() {
        return 'pong';
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi(
        '/parity/version',
        api => ({
          ping: api.get('/ping').handle(async () => 'pong'),
        }),
        {
          version: '1',
          versionType: 'URI',
          versionPrefix: 'v',
        }
      );
    });

    const classVersioned = await createHttpRequest(classApp).get(
      '/v1/parity/version/ping'
    );
    const functionalVersioned = await createHttpRequest(functionalApp).get(
      '/v1/parity/version/ping'
    );
    expect(functionalVersioned.status).toBe(classVersioned.status);
    expect(functionalVersioned.text).toBe(classVersioned.text);

    const classWithoutVersion = await createHttpRequest(classApp).get(
      '/parity/version/ping'
    );
    const functionalWithoutVersion = await createHttpRequest(functionalApp).get(
      '/parity/version/ping'
    );
    expect(functionalWithoutVersion.status).toBe(classWithoutVersion.status);

    await closeApps(classApp, functionalApp);
  });

  it('should keep default onerror behavior consistent for json accept', async () => {
    @Controller('/parity/error')
    class ClassController {
      @Get('/bad-request')
      async badRequest() {
        throw new httpError.BadRequestError('my error');
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/error', api => ({
        badRequest: api.get('/bad-request').handle(async () => {
          throw new httpError.BadRequestError('my error');
        }),
      }));
    });

    const classText = await createHttpRequest(classApp).get(
      '/parity/error/bad-request'
    );
    const functionalText = await createHttpRequest(functionalApp).get(
      '/parity/error/bad-request'
    );
    expect(functionalText.status).toBe(classText.status);

    const classJson = await createHttpRequest(classApp)
      .get('/parity/error/bad-request')
      .set('Accept', 'application/json');
    const functionalJson = await createHttpRequest(functionalApp)
      .get('/parity/error/bad-request')
      .set('Accept', 'application/json');

    expect(functionalJson.status).toBe(classJson.status);
    expect(functionalJson.body).toEqual(classJson.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep queryParseOptions behavior consistent', async () => {
    @Controller('/parity/query-options')
    class ClassController {
      @Get('/value')
      async query(ctx) {
        return ctx.query;
      }
    }

    const globalConfig = {
      koa: {
        queryParseMode: 'first',
        queryParseOptions: {
          parameterLimit: 3,
          arrayLimit: 1,
        },
      },
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/query-options', api => ({
          value: api.get('/value').handle(async ({ input }) => input.query),
        }));
      },
      globalConfig
    );

    const queryText = 'a=1&b=2&a=3&c[0]=1&c[1]=2';
    const classResult = await createHttpRequest(classApp).get(
      `/parity/query-options/value?${queryText}`
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      `/parity/query-options/value?${queryText}`
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.body).toEqual(classResult.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep request.query writeable behavior consistent', async () => {
    @Controller('/parity/query-write')
    class ClassController {
      @Get('/set')
      async setQuery(ctx) {
        ctx.query = { a: 1 };
        return ctx.query;
      }
    }

    const globalConfig = {
      koa: {
        queryParseMode: 'first',
        queryParseOptions: {
          parameterLimit: 3,
          arrayLimit: 1,
        },
      },
    };
    const classApp = await createClassApp([ClassController], globalConfig);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/query-write', api => ({
          set: api.get('/set').handle(async ({ ctx }) => {
            ctx.query = { a: 1 };
            return ctx.query;
          }),
        }));
      },
      globalConfig
    );

    const classResult = await createHttpRequest(classApp).get(
      '/parity/query-write/set'
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      '/parity/query-write/set'
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.body).toEqual(classResult.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep wildcard route behavior consistent', async () => {
    @Controller('/parity/wildcard')
    class ClassController {
      @Get('/*')
      async any(ctx) {
        return `wild:${ctx.path}`;
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/wildcard', api => ({
        any: api.get('/*').handle(async ({ ctx }) => `wild:${ctx.path}`),
      }));
    });

    const classResult = await createHttpRequest(classApp).get(
      '/parity/wildcard/abc/123'
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      '/parity/wildcard/abc/123'
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.text).toBe(classResult.text);

    await closeApps(classApp, functionalApp);
  });

  it('should keep not found behavior consistent on unmatched route', async () => {
    @Controller('/parity/not-found')
    class ClassController {
      @Get('/ok')
      async ok() {
        return 'ok';
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/not-found', api => ({
        ok: api.get('/ok').handle(async () => 'ok'),
      }));
    });

    const classResult = await createHttpRequest(classApp).get(
      '/parity/not-found/missing'
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      '/parity/not-found/missing'
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.status).toBe(404);

    await closeApps(classApp, functionalApp);
  });

  it('should keep global filter behavior consistent', async () => {
    @Catch()
    class GlobalError {
      catch(err) {
        if (err) {
          return {
            status: err.status ?? 500,
            message: err.message,
          };
        }
      }
    }

    @Configuration({
      imports: [],
    })
    class ErrorFilterConfiguration {
      @MainApp()
      app: any;

      async onReady() {
        this.app.useFilter([GlobalError]);
      }
    }

    @Controller('/parity/filter')
    class ClassController {
      @Get('/')
      async home() {
        throw new Error('my error');
      }
    }

    const classApp = await createClassApp([
      ClassController,
      GlobalError,
      ErrorFilterConfiguration,
    ]);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/filter', api => ({
          home: api.get('/').handle(async () => {
            throw new Error('my error');
          }),
        }));
      },
      {},
      [GlobalError, ErrorFilterConfiguration]
    );

    const classResult1 = await createHttpRequest(classApp).get('/parity/filter/11');
    const functionalResult1 = await createHttpRequest(functionalApp).get(
      '/parity/filter/11'
    );
    expect(functionalResult1.status).toBe(classResult1.status);
    expect(functionalResult1.body).toEqual(classResult1.body);

    const classResult2 = await createHttpRequest(classApp).get('/parity/filter');
    const functionalResult2 = await createHttpRequest(functionalApp).get(
      '/parity/filter'
    );
    expect(functionalResult2.status).toBe(classResult2.status);
    expect(functionalResult2.body).toEqual(classResult2.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep json error response behavior consistent', async () => {
    @Controller('/parity/json-error')
    class ClassController {
      @Inject()
      ctx: any;

      @Get('/')
      async home() {
        this.ctx.type = 'json';
        throw new httpError.BadRequestError('my error');
      }

      @Get('/bbb.json')
      async jsonSuffix() {
        throw new httpError.BadRequestError('my error');
      }

      @Get('/accept_json')
      async acceptJson() {
        throw new httpError.BadRequestError('my error');
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/json-error', api => ({
        home: api.get('/').handle(async ({ ctx }) => {
          ctx.type = 'json';
          throw new httpError.BadRequestError('my error');
        }),
        jsonSuffix: api.get('/bbb.json').handle(async () => {
          throw new httpError.BadRequestError('my error');
        }),
        acceptJson: api.get('/accept_json').handle(async () => {
          throw new httpError.BadRequestError('my error');
        }),
      }));
    });

    const classResult1 = await createHttpRequest(classApp).get('/parity/json-error');
    const functionalResult1 = await createHttpRequest(functionalApp).get(
      '/parity/json-error'
    );
    expect(functionalResult1.status).toBe(classResult1.status);
    expect(functionalResult1.body).toEqual(classResult1.body);

    const classResult2 = await createHttpRequest(classApp).get(
      '/parity/json-error/bbb.json'
    );
    const functionalResult2 = await createHttpRequest(functionalApp).get(
      '/parity/json-error/bbb.json'
    );
    expect(functionalResult2.status).toBe(classResult2.status);
    expect(functionalResult2.body).toEqual(classResult2.body);

    const classResult3 = await createHttpRequest(classApp)
      .get('/parity/json-error/accept_json')
      .set('Accept', 'text/*, application/json');
    const functionalResult3 = await createHttpRequest(functionalApp)
      .get('/parity/json-error/accept_json')
      .set('Accept', 'text/*, application/json');
    expect(functionalResult3.status).toBe(classResult3.status);
    expect(functionalResult3.body).toEqual(classResult3.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep middleware return body behavior consistent', async () => {
    @Configuration({
      imports: [],
    })
    class MiddlewareConfiguration {
      @Inject()
      framework: any;

      async onReady() {
        this.framework.useMiddleware(async (ctx, next) => {
          const result = await next();
          if (!result) {
            return {
              code: 0,
              msg: 'ok',
              data: result,
            };
          }
        });
      }
    }

    @Controller('/parity/mw-return')
    class ClassController {
      @Get('/')
      async home() {
        return null;
      }

      @Get('/undefined')
      async rUndefined() {
        return undefined;
      }

      @Get('/null')
      async rNull() {
        return null;
      }
    }

    const classApp = await createClassApp([ClassController, MiddlewareConfiguration]);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/mw-return', api => ({
          home: api.get('/').handle(async () => null),
          rUndefined: api.get('/undefined').handle(async () => undefined),
          rNull: api.get('/null').handle(async () => null),
        }));
      },
      {},
      [MiddlewareConfiguration]
    );

    const classResult1 = await createHttpRequest(classApp).get('/parity/mw-return');
    const functionalResult1 = await createHttpRequest(functionalApp).get(
      '/parity/mw-return'
    );
    expect(functionalResult1.status).toBe(classResult1.status);
    expect(functionalResult1.text).toBe(classResult1.text);

    const classResult2 = await createHttpRequest(classApp).get(
      '/parity/mw-return/undefined'
    );
    const functionalResult2 = await createHttpRequest(functionalApp).get(
      '/parity/mw-return/undefined'
    );
    expect(functionalResult2.status).toBe(classResult2.status);
    expect(functionalResult2.text).toBe(classResult2.text);

    const classResult3 = await createHttpRequest(classApp).get('/parity/mw-return/null');
    const functionalResult3 = await createHttpRequest(functionalApp).get(
      '/parity/mw-return/null'
    );
    expect(functionalResult3.status).toBe(classResult3.status);
    expect(functionalResult3.text).toBe(classResult3.text);

    await closeApps(classApp, functionalApp);
  });

  it('should keep common web behavior consistent', async () => {
    @Controller('/parity/common')
    class ClassController {
      @Get('/set_header')
      async setHeader(ctx) {
        ctx.set('bbb', 'aaa');
        ctx.set('ccc', 'ddd');
        return 'bbb';
      }

      @Get('/header-upper')
      async headerUpper(ctx) {
        return ctx.get('x-abc');
      }

      @Get('/')
      async home(ctx) {
        ctx.status = 201;
        return `hello world,${ctx.query.name}${ctx.query.age}`;
      }

      @Get('/login')
      async login(ctx) {
        ctx.redirect('/parity/common/set_header');
      }

      @Get('/204')
      async s204(ctx) {
        ctx.status = 204;
      }

      @Get('/ctx-body')
      async ctxBody(ctx) {
        ctx.body = 'ctx-body';
      }

      @Post('/')
      async post(ctx) {
        return String(ctx.request.body.bbbb);
      }

      @Get('/case/500')
      async s500() {
        throw new Error('common case error');
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/common', api => ({
        setHeader: api.get('/set_header').handle(async ({ ctx }) => {
          ctx.set('bbb', 'aaa');
          ctx.set('ccc', 'ddd');
          return 'bbb';
        }),
        headerUpper: api.get('/header-upper').handle(async ({ ctx }) =>
          ctx.get('x-abc')
        ),
        home: api.get('/').handle(async ({ ctx, input }) => {
          ctx.status = 201;
          return `hello world,${input.query['name']}${input.query['age']}`;
        }),
        login: api.get('/login').handle(async ({ ctx }) => {
          ctx.redirect('/parity/common/set_header');
        }),
        s204: api.get('/204').handle(async ({ ctx }) => {
          ctx.status = 204;
        }),
        ctxBody: api.get('/ctx-body').handle(async ({ ctx }) => {
          ctx.body = 'ctx-body';
        }),
        post: api
          .post('/')
          .handle(async ({ input }) => String(input.body['bbbb'])),
        s500: api.get('/case/500').handle(async () => {
          throw new Error('common case error');
        }),
      }));
    });

    const classSetHeader = await createHttpRequest(classApp)
      .get('/parity/common/set_header')
      .query({ name: 'harry' });
    const functionalSetHeader = await createHttpRequest(functionalApp)
      .get('/parity/common/set_header')
      .query({ name: 'harry' });
    expect(functionalSetHeader.status).toBe(classSetHeader.status);
    expect(functionalSetHeader.text).toBe(classSetHeader.text);
    expect(functionalSetHeader.headers['bbb']).toBe(classSetHeader.headers['bbb']);
    expect(functionalSetHeader.headers['ccc']).toBe(classSetHeader.headers['ccc']);

    const classHeaderUpper = await createHttpRequest(classApp)
      .get('/parity/common/header-upper')
      .set('x-abc', '321');
    const functionalHeaderUpper = await createHttpRequest(functionalApp)
      .get('/parity/common/header-upper')
      .set('x-abc', '321');
    expect(functionalHeaderUpper.status).toBe(classHeaderUpper.status);
    expect(functionalHeaderUpper.text).toBe(classHeaderUpper.text);

    const classHome = await createHttpRequest(classApp)
      .get('/parity/common')
      .query({ name: 'harry', age: 18 });
    const functionalHome = await createHttpRequest(functionalApp)
      .get('/parity/common')
      .query({ name: 'harry', age: 18 });
    expect(functionalHome.status).toBe(classHome.status);
    expect(functionalHome.text).toBe(classHome.text);

    const classLogin = await createHttpRequest(classApp).get('/parity/common/login');
    const functionalLogin = await createHttpRequest(functionalApp).get(
      '/parity/common/login'
    );
    expect(functionalLogin.status).toBe(classLogin.status);

    const class204 = await createHttpRequest(classApp).get('/parity/common/204');
    const functional204 = await createHttpRequest(functionalApp).get(
      '/parity/common/204'
    );
    expect(functional204.status).toBe(class204.status);

    const classCtxBody = await createHttpRequest(classApp).get(
      '/parity/common/ctx-body'
    );
    const functionalCtxBody = await createHttpRequest(functionalApp).get(
      '/parity/common/ctx-body'
    );
    expect(functionalCtxBody.status).toBe(classCtxBody.status);
    expect(functionalCtxBody.text).toBe(classCtxBody.text);

    const classPost = await createHttpRequest(classApp).post('/parity/common').send({
      bbbb: 222,
    });
    const functionalPost = await createHttpRequest(functionalApp)
      .post('/parity/common')
      .send({
        bbbb: 222,
      });
    expect(functionalPost.status).toBe(classPost.status);
    expect(functionalPost.text).toBe(classPost.text);

    const class500 = await createHttpRequest(classApp).get('/parity/common/case/500');
    const functional500 = await createHttpRequest(functionalApp).get(
      '/parity/common/case/500'
    );
    expect(functional500.status).toBe(class500.status);

    await closeApps(classApp, functionalApp);
  });

  it('should keep params and session behavior consistent', async () => {
    @Controller('/parity/param')
    class ClassController {
      @Get('/param_query')
      async queryName(ctx) {
        return ctx.query.name;
      }

      @Get('/param_query_all')
      async queryAll(ctx) {
        return ctx.query;
      }

      @Post('/param_body')
      async bodyName(ctx) {
        return ctx.request.body.name;
      }

      @Post('/param_body_all')
      async bodyAll(ctx) {
        return ctx.request.body;
      }

      @Get('/param/:name')
      async paramName(ctx) {
        return ctx.params.name;
      }

      @Get('/headers')
      async headers(ctx) {
        return ctx.get('name');
      }

      @Get('/set_session')
      async setSession(ctx) {
        ctx.session.name = 'harry';
        return 'ok';
      }

      @Get('/session')
      async session(ctx) {
        return ctx.session.name;
      }

      @Get('/request_path')
      async requestPath(ctx) {
        return ctx.request.path;
      }

      @Get('/request_ip')
      async requestIp(ctx) {
        return ctx.request.ip;
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/param', api => ({
        queryName: api
          .get('/param_query')
          .handle(async ({ input }) => input.query['name']),
        queryAll: api.get('/param_query_all').handle(async ({ input }) => input.query),
        bodyName: api
          .post('/param_body')
          .handle(async ({ input }) => input.body['name']),
        bodyAll: api
          .post('/param_body_all')
          .handle(async ({ input }) => input.body),
        paramName: api
          .get('/param/:name')
          .handle(async ({ input }) => input.params['name']),
        headers: api.get('/headers').handle(async ({ ctx }) => ctx.get('name')),
        setSession: api.get('/set_session').handle(async ({ ctx }) => {
          ctx.session.name = 'harry';
          return 'ok';
        }),
        session: api.get('/session').handle(async ({ ctx }) => ctx.session.name),
        requestPath: api.get('/request_path').handle(async ({ ctx }) => ctx.request.path),
        requestIp: api.get('/request_ip').handle(async ({ ctx }) => ctx.request.ip),
      }));
    });

    const classQuery = await createHttpRequest(classApp)
      .get('/parity/param/param_query')
      .query('name=harry');
    const functionalQuery = await createHttpRequest(functionalApp)
      .get('/parity/param/param_query')
      .query('name=harry');
    expect(functionalQuery.status).toBe(classQuery.status);
    expect(functionalQuery.text).toBe(classQuery.text);

    const classQueryAll = await createHttpRequest(classApp)
      .get('/parity/param/param_query_all')
      .query({ name: 'harry', other: 1 });
    const functionalQueryAll = await createHttpRequest(functionalApp)
      .get('/parity/param/param_query_all')
      .query({ name: 'harry', other: 1 });
    expect(functionalQueryAll.status).toBe(classQueryAll.status);
    expect(functionalQueryAll.body).toEqual(classQueryAll.body);

    const classBody = await createHttpRequest(classApp)
      .post('/parity/param/param_body')
      .send({ name: 'harry' });
    const functionalBody = await createHttpRequest(functionalApp)
      .post('/parity/param/param_body')
      .send({ name: 'harry' });
    expect(functionalBody.status).toBe(classBody.status);
    expect(functionalBody.text).toBe(classBody.text);

    const classBodyAll = await createHttpRequest(classApp)
      .post('/parity/param/param_body_all')
      .send({ name: 'harry', other: 1 });
    const functionalBodyAll = await createHttpRequest(functionalApp)
      .post('/parity/param/param_body_all')
      .send({ name: 'harry', other: 1 });
    expect(functionalBodyAll.status).toBe(classBodyAll.status);
    expect(functionalBodyAll.body).toEqual(classBodyAll.body);

    const classParam = await createHttpRequest(classApp).get('/parity/param/param/harry');
    const functionalParam = await createHttpRequest(functionalApp).get(
      '/parity/param/param/harry'
    );
    expect(functionalParam.status).toBe(classParam.status);
    expect(functionalParam.text).toBe(classParam.text);

    const classHeaders = await createHttpRequest(classApp)
      .get('/parity/param/headers')
      .set({ name: 'harry' });
    const functionalHeaders = await createHttpRequest(functionalApp)
      .get('/parity/param/headers')
      .set({ name: 'harry' });
    expect(functionalHeaders.status).toBe(classHeaders.status);
    expect(functionalHeaders.text).toBe(classHeaders.text);

    const classSetSession = await createHttpRequest(classApp).get(
      '/parity/param/set_session'
    );
    const classCookie = classSetSession.headers['set-cookie'];
    const functionalSetSession = await createHttpRequest(functionalApp).get(
      '/parity/param/set_session'
    );
    const functionalCookie = functionalSetSession.headers['set-cookie'];

    const classSession = await createHttpRequest(classApp)
      .get('/parity/param/session')
      .set('Cookie', classCookie);
    const functionalSession = await createHttpRequest(functionalApp)
      .get('/parity/param/session')
      .set('Cookie', functionalCookie);
    expect(functionalSession.status).toBe(classSession.status);
    expect(functionalSession.text).toBe(classSession.text);

    const classPath = await createHttpRequest(classApp).get('/parity/param/request_path');
    const functionalPath = await createHttpRequest(functionalApp).get(
      '/parity/param/request_path'
    );
    expect(functionalPath.status).toBe(classPath.status);
    expect(functionalPath.text).toBe(classPath.text);

    const classIp = await createHttpRequest(classApp).get('/parity/param/request_ip');
    const functionalIp = await createHttpRequest(functionalApp).get(
      '/parity/param/request_ip'
    );
    expect(functionalIp.status).toBe(classIp.status);
    expect(functionalIp.text).toBe(classIp.text);

    await closeApps(classApp, functionalApp);
  });

  it('should keep default query parser behavior consistent', async () => {
    @Controller('/parity/query-default')
    class ClassController {
      @Get('/value')
      async query(ctx) {
        return ctx.query;
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/query-default', api => ({
        value: api.get('/value').handle(async ({ input }) => input.query),
      }));
    });

    const queryText = 'a=1&b=2&a=3&c[0]=1&c[1]=2';
    const classResult = await createHttpRequest(classApp).get(
      `/parity/query-default/value?${queryText}`
    );
    const functionalResult = await createHttpRequest(functionalApp).get(
      `/parity/query-default/value?${queryText}`
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.body).toEqual(classResult.body);

    await closeApps(classApp, functionalApp);
  });

  it('should keep locals and state proxy behavior consistent', async () => {
    @Controller('/parity/state')
    class ClassController {
      @Get('/')
      async home(ctx) {
        ctx.locals = {
          b: 2,
        };
        ctx.state['a'] = 1;
        return {
          locals: ctx.locals,
          state: ctx.state,
        };
      }
    }

    const classApp = await createClassApp([ClassController]);
    const functionalApp = await createFunctionalApp(() => {
      return defineApi('/parity/state', api => ({
        home: api.get('/').handle(async ({ ctx }) => {
          ctx.locals = {
            b: 2,
          };
          ctx.state['a'] = 1;
          return {
            locals: ctx.locals,
            state: ctx.state,
          };
        }),
      }));
    });

    const classResult = await createHttpRequest(classApp).get('/parity/state');
    const functionalResult = await createHttpRequest(functionalApp).get(
      '/parity/state'
    );

    expect(functionalResult.status).toBe(classResult.status);
    expect(functionalResult.text).toBe(classResult.text);

    await closeApps(classApp, functionalApp);
  });

  it('should keep http forward and dynamic router behavior consistent', async () => {
    @Configuration({
      imports: [],
    })
    class ForwardConfiguration {
      @Inject()
      webRouterService: MidwayWebRouterService;

      async onReady() {
        this.webRouterService.addRouter(
          async () => {
            return 'hello world';
          },
          {
            url: '/api/user',
            requestMethod: 'GET',
          }
        );
      }
    }

    @Controller('/')
    class ClassController {
      @Inject()
      ctx: any;

      @Get('/exists')
      async exists() {
        return this.ctx.forward('/api/getData');
      }

      @Get('/not-exists')
      async notExists() {
        return this.ctx.forward('/api/not-exists');
      }

      @Get('/forward-function')
      async forwardFunction() {
        return this.ctx.forward('/api/user');
      }
    }

    @Controller('/api')
    class ClassAPIController {
      @Get('/getData')
      async getData() {
        return 'exists';
      }
    }

    const classApp = await createClassApp([
      ClassController,
      ClassAPIController,
      ForwardConfiguration,
    ]);
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/', api => ({
          exists: api
            .get('/exists')
            .handle(async ({ ctx }) => ctx.forward('/api/getData')),
          notExists: api
            .get('/not-exists')
            .handle(async ({ ctx }) => ctx.forward('/api/not-exists')),
          forwardFunction: api
            .get('/forward-function')
            .handle(async ({ ctx }) => ctx.forward('/api/user')),
          getData: api.get('/api/getData').handle(async () => 'exists'),
        }));
      },
      {},
      [ForwardConfiguration]
    );

    const classExists = await createHttpRequest(classApp).get('/exists');
    const functionalExists = await createHttpRequest(functionalApp).get('/exists');
    expect(functionalExists.status).toBe(classExists.status);
    expect(functionalExists.text).toBe(classExists.text);

    const classNotExists = await createHttpRequest(classApp).get('/not-exists');
    const functionalNotExists = await createHttpRequest(functionalApp).get('/not-exists');
    expect(functionalNotExists.status).toBe(classNotExists.status);

    const classForwardFn = await createHttpRequest(classApp).get('/forward-function');
    const functionalForwardFn = await createHttpRequest(functionalApp).get(
      '/forward-function'
    );
    expect(functionalForwardFn.status).toBe(classForwardFn.status);
    expect(functionalForwardFn.text).toBe(classForwardFn.text);

    await closeApps(classApp, functionalApp);
  });

  it('should keep server timeout behavior consistent', async () => {
    @Configuration({
      imports: [],
    })
    class TimeoutConfiguration {
      @MainApp()
      app: any;

      async onServerReady() {
        this.app
          .getFramework()
          .getServer()
          .on('timeout', socket => {
            socket.destroy();
          });
      }
    }

    @Controller('/parity/timeout')
    class ClassController {
      @Get('/timeout')
      async timeout() {
        await sleep(1200);
        return 'hello world';
      }
    }

    const globalConfig = {
      koa: {
        serverTimeout: 1000,
      },
    };
    const classApp = await createClassApp(
      [ClassController, TimeoutConfiguration],
      globalConfig
    );
    const functionalApp = await createFunctionalApp(
      () => {
        return defineApi('/parity/timeout', api => ({
          timeout: api.get('/timeout').handle(async () => {
            await sleep(1200);
            return 'hello world';
          }),
        }));
      },
      globalConfig,
      [TimeoutConfiguration]
    );

    const classServer = (classApp.getFramework() as any).getServer();
    const functionalServer = (functionalApp.getFramework() as any).getServer();
    await classServer.listen(0);
    await functionalServer.listen(0);

    let classErr;
    try {
      await makeHttpRequest(
        `http://localhost:${classServer.address().port}/parity/timeout/timeout`,
        {
          method: 'GET',
          dataType: 'text',
        }
      );
    } catch (err) {
      classErr = err;
    }

    let functionalErr;
    try {
      await makeHttpRequest(
        `http://localhost:${functionalServer.address().port}/parity/timeout/timeout`,
        {
          method: 'GET',
          dataType: 'text',
        }
      );
    } catch (err) {
      functionalErr = err;
    }

    expect(Boolean(classErr)).toBe(true);
    expect(Boolean(functionalErr)).toBe(true);
    expect(functionalErr.message).toMatch(/socket hang up/);
    expect(classErr.message).toMatch(/socket hang up/);

    await classServer.close();
    await functionalServer.close();
    await closeApps(classApp, functionalApp);
  });
});
