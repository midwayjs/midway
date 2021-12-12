import { APPLICATION_KEY, MidwayFrameworkType, Provide, } from '@midwayjs/decorator';
import { MidwayContextLogger } from '@midwayjs/logger';
import * as assert from 'assert';
import * as path from 'path';
import * as mm from 'mm';
import {
  getCurrentApplicationContext,
  getCurrentMainApp,
  getCurrentMainFramework,
  MidwayFrameworkService,
  MidwayRequestContainer,
  MidwayDecoratorService,
  MidwayMiddlewareService,
  ContextMiddlewareManager,
} from '../src';
import { createLightFramework } from './util';
import sinon = require('sinon');

@Provide()
class TestModule {
  test() {
    return 'hello';
  }
}

describe('/test/baseFramework.test.ts', () => {
  it('should load preload module', async () => {
    const framework = await createLightFramework(path.join(__dirname, './fixtures/base-app/src'));
    const appCtx = framework.getApplicationContext();
    appCtx.bind(TestModule);
    const module: any = await appCtx.getAsync('testModule');
    assert(module.test() === 'hello');
  });

  it('should load configuration', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration/base-app-decorator/src'
    ));
    const decoratorService = await framework.getApplicationContext().getAsync(MidwayDecoratorService);
    decoratorService.registerPropertyHandler(APPLICATION_KEY, () => ({
      getBaseDir() {
        return 'base dir';
      }
    }));

    const appCtx = framework.getApplicationContext();

    const baseService: any = await appCtx.getAsync('baseService');
    assert((await baseService.getInformation()) === 'harry,one article');
    assert.strictEqual(baseService.getAaa(), 123);
    assert.strictEqual(baseService.getCcc(), 'mock');
  });

  it('should load config.*.ts by default env', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration/base-app-decorator/src'
    ));
    const appCtx = framework.getApplicationContext();

    const replaceManager: any = await appCtx.getAsync('ok:replaceManager');
    expect(await replaceManager.getOne()).toEqual('ok');
  });

  it('should load config.*.ts by process.env', async () => {
    mm(process.env, 'NODE_ENV', 'local');
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration/base-app-decorator/src'
    ));
    const appCtx = framework.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok1');
    mm.restore();
  });

  it('should load config.*.ts by process.env MIDWAY_SERVER_ENV', async () => {
    const callback = sinon.spy();
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    mm(console, 'log', m => {
      callback(m);
    });

    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration/base-app-decorator/src'
    ));

    const appCtx = framework.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok1');
    assert.ok(
      callback.withArgs('------auto configuration ready now').calledOnce
    );
    mm.restore();
  });

  it('should load with no package.json', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration/base-app-no-package-json/src'
    ));

    const appCtx = framework.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('ok:replaceManager');
    assert((await replaceManager.getOne()) === 'oktwo');
    const replaceManagerno: any = await appCtx.getAsync(
      'midway-plugin-no-pkg-json:replaceManager'
    );
    assert((await replaceManagerno.getOne()) === 'oktwo');

    const replaceManagerTwo: any = await appCtx.getAsync('ok:replaceManagerTwo');
    assert((await replaceManagerTwo.getOne()) === 'oktwo');
    mm.restore();
  });

  it('should load configuration with object', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration-object/base-app-decorator/src'
    ));

    const appCtx = framework.getApplicationContext();
    // 取默认 namespace
    const replaceManager1: any = await appCtx.getAsync(
      'replaceManager'
    );
    expect(await replaceManager1.getOne()).toEqual('one article');
    // 取自定义 namespace
    const replaceManager2: any = await appCtx.getAsync('ok:replaceManager');
    expect(await replaceManager2.getOne()).toEqual('ok2');
    mm.restore();
  });

  // it('should load conflict with error', async () => {
  //   const framework = new MockFramework();
  //   await framework.initialize();
  //   container.load({
  //     loadDir: path.join(
  //       __dirname,
  //       './fixtures/app-with-conflict/base-app-decorator/src'
  //     ),
  //     disableConflictCheck: false,
  //   });
  //   loader.initialize();
  //   const callback = sinon.spy();
  //   try {
  //     loader.loadDirectory();
  //
  //   } catch (e) {
  //     callback(e.message);
  //   }
  //   const p = path.resolve(
  //     __dirname,
  //     './fixtures/app-with-conflict/base-app-decorator/src/lib/'
  //   );
  //   const s = `baseService path = ${p}/userManager.ts already exist (${p}/service.ts)!`;
  //   assert.ok(callback.withArgs(s).calledOnce);
  // });

  it('should load conflict without error', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-conflict/base-app-decorator/src'
    ));
    const appCtx = framework.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert.ok((await baseService.getInformation()) === 'this is conflict');
  });

  describe('test load different env', () => {
    afterEach(mm.restore);

    it('load default env', async () => {
      mm(process.env, 'NODE_ENV', '');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config/src'
      ));

      const value = framework.getConfiguration();
      assert(value['env'] === 'prod');
      assert(value['bbb'] === '111');
    });

    it('load prod env', async () => {
      mm(process.env, 'NODE_ENV', 'prod');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config/src'
      ));

      const value = framework.getConfiguration('env');
      assert(value === 'prod');
    });

    it('load daily env', async () => {
      mm(process.env, 'NODE_ENV', 'daily');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config/src'
      ));
      const value = framework.getConfiguration('env');
      assert(value === 'daily');
    });

    it('load pre env', async () => {
      mm(process.env, 'NODE_ENV', 'pre');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config/src'
      ));

      const value = framework.getConfiguration('env');
      assert(value === 'pre');
    });

    it('load local env', async () => {
      mm(process.env, 'NODE_ENV', 'local');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config/src'
      ));

      expect(framework.getConfiguration('env')).toEqual('local');
      expect(framework.getConfiguration('in')).toEqual(2);
      expect(framework.getConfiguration('out')).toEqual(1);
    });
  });

  describe('test load different env by load directory', () => {
    afterEach(mm.restore);

    it('load default env', async () => {
      mm(process.env, 'NODE_ENV', '');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config-dir/src'
      ));

      const applicationContext = framework.getApplicationContext();

      const value = framework.getConfiguration();
      assert(value['env'] === 'prod');
      assert(value['bbb'] === '222');

      const configManager = await applicationContext.getAsync<{
        allConfig: any;
        bbbConfig: any;
      }>('configManager');
      assert(configManager.allConfig['env'] === 'prod');
      assert(configManager.allConfig['bbb'] === '222');
      assert(configManager.bbbConfig === '222');
    });

    it('load prod env', async () => {
      mm(process.env, 'NODE_ENV', 'prod');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config-dir/src'
      ));

      const value = framework.getConfiguration('env');
      assert(value === 'prod');
    });

    it('load daily env', async () => {
      mm(process.env, 'NODE_ENV', 'daily');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config-dir/src'
      ));

      const value = framework.getConfiguration('env');
      assert(value === 'daily');
    });

    it('load pre env', async () => {
      mm(process.env, 'NODE_ENV', 'pre');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = await createLightFramework(path.join(
        __dirname,
        './fixtures/app-with-configuration-config-dir/src'
      ));

      const value = framework.getConfiguration('env');
      assert(value === 'pre');
    });

  });

  it('should test aspect decorator', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-aspect/src'
    ));

    const home: any = await framework.getApplicationContext().getAsync('home');
    expect(home.hello()).toEqual('hello worlddddccccfff');
    expect(await home.hello1()).toEqual('hello world 1');
    expect(await home.hello2()).toEqual('hello worldcccppp');

    const ctx1 = {id: 1};
    const requestContext = new MidwayRequestContainer(ctx1, framework.getApplicationContext());
    const userController1: any = await requestContext.getAsync('userController');
    try {
      await userController1.getUser();
    } catch (err) {
      expect(err.message).toMatch('ccc');
    }
    // aspect chain
    const result = await userController1.test1().test2().getUser1();
    expect(result).toEqual('before test user');
  });

  it('should inject global value in component', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration-global-inject/base-app-decorator/src'
    ));
    const home: any = await framework.getApplicationContext().getAsync('SQL:home');
    expect(await home.getData()).toMatch(/base-app-decorator\/src\/bbbb\/dddd/);
  });

  it('should load component in different type and different env', async () => {
    mm(process.env, 'NODE_ENV', '');
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration-load/src'
    ));
    const value = framework.getConfiguration();
    expect(value['a']).toEqual(1);
    expect(value['b']).toEqual(1);
    mm.restore();
  });

  it('should get service in a component write with app', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-custom-component-in-app/src'
    ));

    const appCtx = framework.getApplicationContext();
    const userController = await appCtx.getAsync('userController');
    const books = await (userController as any).getBooksByUser();
    expect(books).toEqual([
      {
        'isbn': '9787115549440',
        'name': '无限可能'
      },
      {
        'isbn': '9787305236525',
        'name': '明智的孩子'
      },
      {
        'isbn': '9787020166916',
        'name': '伊卡狛格'
      }
    ]);
    await framework.stop();
  });

  it('should create logger and match property between framework and app', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-logger/src'
    ));
    expect(framework.getApplication().getLogger()).toEqual(framework.getLogger());
    expect(framework.getApplication().getLogger('coreLogger')).toEqual(framework.getLogger('coreLogger'));
    expect(framework.getApplication().getCoreLogger()).toEqual(framework.getLogger('coreLogger'));
    expect(framework.getApplication().getCoreLogger()).toEqual(framework.getCoreLogger());
    expect(framework.getApplication().getLogger('logger')).toEqual(framework.getLogger('logger'));
    expect(framework.getApplication().getLogger('otherLogger')).not.toBeNull();
    expect(framework.getApplication().getLogger('otherLogger')).toEqual(framework.getLogger('otherLogger'));

    expect(framework.getApplication().getAppDir()).toEqual(framework.getAppDir());
    expect(framework.getApplication().getBaseDir()).toEqual(framework.getBaseDir());
    expect(framework.getApplication().getApplicationContext()).toEqual(framework.getApplicationContext());
    expect(framework.getApplication().getFrameworkType()).toEqual(framework.getFrameworkType());
    expect(framework.getApplication().getProjectName()).toEqual(framework.getProjectName());

    // test context
    class CustomContextLogger extends MidwayContextLogger<any> {
      formatContextLabel(): string {
        return 'bbbb';
      }
    }

    framework.getApplication().setContextLoggerClass(CustomContextLogger);
    expect(framework.getApplication().createAnonymousContext().startTime).toBeDefined();
    const ctxLogger = framework.getApplication().createAnonymousContext().getLogger();
    ctxLogger.info('ctx logger');

    expect(framework.getApplication().createAnonymousContext().requestContext).toBeDefined();
    expect(framework.getApplication().createAnonymousContext().logger).toBeDefined();

    await framework.stop();
  });

  it('should support functional configuration and hook load', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-functional-component/src'
    ));
    expect(framework.getConfiguration('a')).toEqual(1);

    await framework.stop();

    // const appCtx = framework.getApplicationContext();
  });

  it('should run multi framework in one process and use cache', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-multi-framework-shared/src'
    ));

    const applicationContext = framework.getApplicationContext();
    const frameworkService = await applicationContext.getAsync(MidwayFrameworkService);
    expect(frameworkService.getFramework(MidwayFrameworkType.LIGHT)).toBeUndefined();
    expect(frameworkService.getFramework(MidwayFrameworkType.FAAS)).toBeDefined();

    const framework1 = frameworkService.getFramework(MidwayFrameworkType.EMPTY);
    const framework2 = frameworkService.getFramework(MidwayFrameworkType.MS_GRPC);

    expect(framework1.getApplicationContext()).toEqual(framework2.getApplicationContext());
    // share application context data
    const userService1 = await framework1.getApplicationContext().getAsync('userService');
    const userService2 = await framework2.getApplicationContext().getAsync('userService');
    // 相同实例
    expect(userService1['id']).toEqual(userService2['id']);

    expect(framework1.getApplicationContext().get('total')['num']).toEqual(1);
    expect(framework2.getApplicationContext().get('total')['num']).toEqual(1);

    expect(framework2.getApplicationContext().get('total2')['num']).toEqual(0);
  });

  it('should inject component service with class', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-component-inject-with-class/main/src'
    ));

    const appCtx = framework.getApplicationContext();
    const userController = await appCtx.getAsync('userController');
    const books = await (userController as any).getBooksByUser();
    expect(books).toEqual([
      {
        'name': '无限可能str',
        'isbn': '9787115549440str'
      },
      {
        'name': '明智的孩子str',
        'isbn': '9787305236525str'
      },
      {
        'name': '伊卡狛格str',
        'isbn': '9787020166916str'
      },
      {
        'isbn': '9787115549440',
        'name': '无限可能'
      },
      {
        'isbn': '9787305236525',
        'name': '明智的孩子'
      },
      {
        'isbn': '9787020166916',
        'name': '伊卡狛格'
      }
    ]);

    await framework.stop();
    expect((global as any).container_not_null).toBeTruthy();
  });

  it('component circular dependency should be ok', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-component-inject-with-class/main/src'
    ));
    const appCtx = framework.getApplicationContext();
    const circularService = await appCtx.getAsync('circular:circularService');

    expect(circularService).not.toBeNull();
    await framework.stop();
  });

  it('should test global framework', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app/src'
    ));
    mm(global, 'MIDWAY_MAIN_FRAMEWORK', framework);

    const appCtx = framework.getApplicationContext();
    expect(getCurrentMainFramework()).toEqual(framework);
    expect(getCurrentApplicationContext()).toEqual(appCtx);
    expect(getCurrentMainApp()).toEqual(framework.getApplication());

    mm.restore();
  });

  it('should test attr api', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app/src'
    ));

    framework.getApplicationContext().setAttr('bcd', 1);
    expect(framework.getApplicationContext().getAttr('bcd')).toEqual(1);

    const app = framework.getApplication();
    app.setAttr('abc', 1);
    expect(app.getAttr('abc')).toEqual(1);

    framework.getApplicationContext().setAttr('abc', 2);
    expect(app.getAttr('abc')).toEqual(2);
  });

  it('should test object config load', async () => {
    mm(process.env, 'NODE_ENV', 'unittest');
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-config-object/src'
    ));

    const config = framework.getConfiguration();
    expect(config.hello.a).toEqual(1);
    expect(config.hello.b).toEqual(4);
    mm.restore();
  });

  it('should test load async config', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-config-async-load/src'
    ));

    const config = framework.getConfiguration();
    expect(config.e).toEqual(333);
  });

  it('should test autoload', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-autoload/src'
    ));

    const applicationContext: any = framework.getApplicationContext();
    const rid = applicationContext.identifierMapping.getRelation('userService');
    expect(applicationContext.getManagedResolverFactory().singletonCache.has(rid)).toBeTruthy();
  });

  it('should test object lifecycle', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-object-lifecycle/src'
    ));

    const applicationContext: any = framework.getApplicationContext();
    await applicationContext.getAsync('userService');
    expect(framework.getApplication().getAttr('total')).toEqual(10);
  });

  it('should test middleware manager', async () => {
    @Provide()
    class TestMiddleware1 {
      resolve() {
        return async (ctx, next) => {
          return 'hello ' + await next();
        }
      }
    }

    @Provide()
    class TestMiddleware2 {
      resolve() {
        return async (ctx, next) => {
          return 'world ' + await next();
        }
      }
    }

    const framework = await createLightFramework();
    framework.getApplicationContext().bind(TestMiddleware1);
    framework.getApplicationContext().bind(TestMiddleware2);

    framework.useMiddleware([TestMiddleware1, TestMiddleware2]);

    let data1 = 'abc';
    const fn = await framework.getMiddleware(async (ctx) => {
      return data1;
    });

    expect(await fn({})).toEqual('hello world abc');

    data1 = 'efg';
    expect(await fn({})).toEqual('hello world efg');
  });

  it('should test middleware manager with compose', async () => {
    @Provide()
    class TestMiddleware1 {
      resolve() {
        return async (ctx, next) => {
          return 'hello ' + await next();
        }
      }
    }

    @Provide()
    class TestMiddleware2 {
      resolve() {
        return async (ctx, next) => {
          return 'world ' + await next();
        }
      }
    }

    @Provide()
    class TestMiddleware3 {
      resolve() {
        return async (ctx, next) => {
          return 'zhangting';
        }
      }
    }

    const framework = await createLightFramework();
    framework.getApplicationContext().bind(TestMiddleware1);
    framework.getApplicationContext().bind(TestMiddleware2);
    framework.getApplicationContext().bind(TestMiddleware3);

    // 添加一个中间件
    framework.useMiddleware([TestMiddleware1, TestMiddleware2]);

    // compose 一下，再同时插入一个
    const fn = await framework.getMiddleware(async (ctx, next: any) => {
      return 'gogogo, ' + await next();
    });

    // 建一个新的
    const middlewareManager = new ContextMiddlewareManager();
    // 把 compose 的结果作为第一个
    middlewareManager.insertLast(fn);
    // 再插入一个
    middlewareManager.insertLast(TestMiddleware3);

    const middlewareService = await framework.getApplicationContext().getAsync(MidwayMiddlewareService);

    // 再 compose
    const composeMiddleware = await middlewareService.compose(
      middlewareManager,
      {} as any
    );

    expect(await composeMiddleware({})).toEqual('hello world gogogo, zhangting');
  });

  it('load object config in configuration', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/app-with-configuration-config-object/src'
    ));

    expect(framework.getConfiguration('bbb')).toEqual(222);
    expect(framework.getConfiguration('ccc')).toEqual(333);
  });

});
