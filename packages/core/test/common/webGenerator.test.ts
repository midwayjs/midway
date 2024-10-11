import {
  WebControllerGenerator,
  RouterInfo,
  IMidwayApplication,
  MidwayWebRouterService,
  MidwayContainer,
  MidwayMiddlewareService,
  Get,
  WEB_RESPONSE_HTTP_CODE, WEB_RESPONSE_HEADER, WEB_RESPONSE_CONTENT_TYPE, WEB_RESPONSE_REDIRECT
} from '../../src';

describe('test/common/web_generator.test.ts', function () {
  it('should test create generator', async () => {
    const container = new MidwayContainer();
    container.bind(MidwayMiddlewareService);
    await container.getAsync(MidwayMiddlewareService);

    const mockApp = {
      getApplicationContext: () => {
        return container;
      },
      getCoreLogger: () => {
        return console;
      },
      getNamespace: () => {
        return 'web';
      }
    } as unknown as IMidwayApplication;
    const routerService = new MidwayWebRouterService();
    const mockRouterList = [];

    class TestController {
      @Get('/', {
        middleware: [async () => {
        }]
      })
      async invoke() {
        return 'hello world';
      }
    }

    routerService.addController(TestController, {
      prefix: '/api',
      routerOptions: {
        middleware: [async () => {
        }]
      }
    });

    class Router {
      use() {
      }

      get() {
      }
    }

    class MockWebGenerator extends WebControllerGenerator<Router> {
      constructor() {
        super(mockApp, routerService);
      }

      createRouter(routerOptions) {
        return new Router();
      }

      generateController(routeInfo: RouterInfo) {
      }
    }

    const generator = new MockWebGenerator();

    await generator.loadMidwayController(newRouter => {
      mockRouterList.push(newRouter);
    });

    expect(mockRouterList.length).toEqual(1);

  });

  describe('generate koa controller', () => {

    class Router {
      use() {
      }

      get() {
      }
    }

    class HomeController {
      async invoke() {
        return 'hello world';
      }

      async setNull() {
        return null;
      }
    }

    it('throw forbidden error', async () => {
      class KoaControllerGenerator extends WebControllerGenerator<Router> {
        constructor() {
          super({
            getFramework() {
              return {
                runGuard() {
                  return false;
                }
              };
            }
          } as any, null);
        }

        createRouter(routerOptions) {
          return new Router();
        }

        generateController(routeInfo: RouterInfo) {
          return this.generateKoaController(routeInfo);
        }
      }

      const generator = new KoaControllerGenerator();
      const controller = generator.generateController({
        method: 'get',
        requestMethod: 'get',
        url: '/api',
        prefix: '/api',
        controllerClz: HomeController,
      });


      let error;
      try {
        await controller({
          response: {}
        }, () => {
        });
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch('Forbidden');
    });

    it('run controller', async () => {
      class KoaControllerGenerator extends WebControllerGenerator<Router> {
        constructor() {
          super({
            getFramework() {
              return {
                runGuard() {
                  return true;
                }
              };
            },
          } as any, null);
        }

        createRouter(routerOptions) {
          return new Router();
        }

        generateController(routeInfo: RouterInfo) {
          return this.generateKoaController(routeInfo);
        }
      }

      const generator = new KoaControllerGenerator();
      const controller = generator.generateController({
        method: 'invoke',
        requestMethod: 'get',
        url: '/api',
        prefix: '/api',
        controllerClz: HomeController,
        responseMetadata: [
          {
            type: WEB_RESPONSE_HTTP_CODE,
            code: 201,
          },
          {
            type: WEB_RESPONSE_HEADER,
            setHeaders: {
              'x-test': 'test'
            }
          },
          {
            type: WEB_RESPONSE_CONTENT_TYPE,
            contentType: 'text/html'
          },
          {
            type: WEB_RESPONSE_REDIRECT,
            code: 302,
            url: '/test'
          }
        ]
      });

      const ctx = {
        requestContext: {
          getAsync() {
            return new HomeController();
          }
        },
        response: {
          headers: {},
        } as any,
        body: undefined,
        statusArr: [],
        set status(value) {
          ctx.statusArr.push(value);
        },
        set(key, value) {
          ctx.response.headers[key] = value;
        },
        type: '',
        redirect: (v) => {
          ctx.redirectValue = v;
        },
        redirectValue: '',
      };

      await controller(ctx, () => {
      });

      expect(ctx.body).toEqual('hello world');
      expect(ctx.statusArr[0]).toEqual(201);
      expect(ctx.response.headers['x-test']).toEqual('test');
      expect(ctx.type).toEqual('text/html');
      expect(ctx.statusArr[1]).toEqual(302);
      expect(ctx.redirectValue).toEqual('/test');
    });

    it('get null result', async () => {
      class KoaControllerGenerator extends WebControllerGenerator<Router> {
        constructor() {
          super({
            getFramework() {
              return {
                runGuard() {
                  return true;
                }
              };
            },
          } as any, null);
        }

        createRouter(routerOptions) {
          return new Router();
        }

        generateController(routeInfo: RouterInfo) {
          return this.generateKoaController(routeInfo);
        }
      }

      const generator = new KoaControllerGenerator();
      const controller = generator.generateController({
        method: 'setNull',
        requestMethod: 'get',
        url: '/api',
        prefix: '/api',
        controllerClz: HomeController,
      });

      const ctx = {
        requestContext: {
          getAsync() {
            return new HomeController();
          }
        },
        response: {} as any,
        body: undefined,
      };

      await controller(ctx, () => {
      });

      expect(ctx.body).toEqual(undefined);
      expect(ctx.response._body).toEqual(null);
      expect(ctx.response._midwayControllerNullBody).toEqual(true);
    });

    it('run function router', async () => {
      class KoaControllerGenerator extends WebControllerGenerator<Router> {
        constructor() {
          super({
            getFramework() {
              return {
                runGuard() {
                  return true;
                }
              };
            },
          } as any, null);
        }

        createRouter(routerOptions) {
          return new Router();
        }

        generateController(routeInfo: RouterInfo) {
          return this.generateKoaController(routeInfo);
        }
      }

      const generator = new KoaControllerGenerator();
      const controller = generator.generateController({
        method: async () => {
          return 'hello world';
        },
        requestMethod: 'get',
        url: '/api',
        prefix: '/api',
      });

      const ctx = {
        response: {} as any,
        body: undefined,
      };

      await controller(ctx, () => {
      });

      expect(ctx.body).toEqual('hello world');
    });
  });
});
