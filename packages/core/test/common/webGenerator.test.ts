import { WebControllerGenerator, RouterInfo, IMidwayApplication, MidwayWebRouterService, MidwayContainer, MidwayMiddlewareService, Get } from '../../src';

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
      getFrameworkType: () => {
        return 'web';
      }
    } as unknown as IMidwayApplication;
    const routerService = new MidwayWebRouterService();
    const mockRouterList = [];
    class TestController {
      @Get('/', {
        middleware: [async () => {}]
      })
      async invoke()  {
        return 'hello world';
      }
    }
    routerService.addController(TestController, {
      prefix: '/api',
      routerOptions: {
        middleware: [async () => {}]
      }
    });

    class Router {
      use() {}
      get() {}
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
});
