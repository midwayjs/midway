import {
  APPLICATION_KEY,
  CONFIGURATION_KEY,
  LIFECYCLE_IDENTIFIER_PREFIX,
  MidwayFrameworkType,
  Provide,
  resetModule,
} from '@midwayjs/decorator';
import { MidwayContextLogger } from '@midwayjs/logger';
import * as assert from 'assert';
import * as path from 'path';
import {
  clearAllModule,
  clearContainerCache,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  MidwayRequestContainer,
  LightFramework,
} from '../src';
import * as mm from 'mm';
import { LifeCycleTest, LifeCycleTest1, TestBinding } from './fixtures/lifecycle';
import sinon = require('sinon');
import { getCurrentApplicationContext, getCurrentMainApp, getCurrentMainFramework } from '../src/util/contextUtil';

@Provide()
class TestModule {
  test() {
    return 'hello';
  }
}

describe('/test/baseFramework.test.ts', () => {
  beforeEach(() => {
    clearAllModule();
    clearContainerCache();
  });

  it.skip('should load js directory and auto disable', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(__dirname, './fixtures/js-app-loader'),
      isTsMode: false,
    });

    const appCtx = framework.getApplicationContext();
    try {
      await appCtx.getAsync('app');
    } catch (err) {
      assert(err);
    }
  });

  it('should load preload module', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(__dirname, './fixtures/base-app/src'),
      preloadModules: [TestModule],
    });

    const appCtx = framework.getApplicationContext();
    const module: any = await appCtx.getAsync('testModule');
    assert(module.test() === 'hello');
  });

  it('should load configuration', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      )
    });

    framework.getApplicationContext().registerDataHandler(APPLICATION_KEY, () => ({
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
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      )
    });

    const appCtx = framework.getApplicationContext();

    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    expect(await replaceManager.getOne()).toEqual('ok');
  });

  it('should load config.*.ts by process.env', async () => {
    mm(process.env, 'NODE_ENV', 'local');
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      ),
    });
    const appCtx = framework.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok1');
    mm.restore();
  });

  it('should load config.*.ts by process.env MIDWAY_SERVER_ENV', async () => {
    const callback = sinon.spy();
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    mm(console, 'log', m => {
      callback(m);
    });

    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      ),
    });

    const appCtx = framework.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok1');
    assert.ok(
      callback.withArgs('------auto configuration ready now').calledOnce
    );
    mm.restore();
  });

  it('should load with no package.json', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-no-package-json/src'
      ),
    });

    const appCtx = framework.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager.getOne()) === 'oktwo');
    const replaceManagerno: any = await appCtx.getAsync(
      '@midway-plugin-no-pkg-json:replaceManager'
    );
    assert((await replaceManagerno.getOne()) === 'oktwo');

    const replaceManagerTwo: any = await appCtx.getAsync('@ok:replaceManagerTwo');
    assert((await replaceManagerTwo.getOne()) === 'oktwo');
    mm.restore();
  });

  it('should load configuration with namespace', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration-namespace/base-app-decorator/src'
      ),
    });

    const appCtx = framework.getApplicationContext();
    // 取默认 namespace
    const replaceManager1: any = await appCtx.getAsync(
      '@midway-plugin-mock:replaceManager'
    );
    assert((await replaceManager1.getOne()) === 'one article');
    // 取自定义 namespace
    const replaceManager2: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager2.getOne()) === 'ok3');
    // 查看覆盖的情况
    const baseService: any = await appCtx.getAsync('baseService');
    expect(await baseService.getInformation()).toEqual('harryone article atmod,one article,ok3');

    assert(baseService.helloworld === 234);

    assert(baseService.articleManager1);
    assert((await baseService.articleManager1.getOne()) === 'ok3empty');

    assert(baseService.articleManager2);
    assert((await baseService.articleManager2.getOne()) === 'ok3emptytwo');

    const userManager: any = await appCtx.getAsync('userManager');
    assert((await userManager.getUser()) === 'harryone article atmod');
    assert((await userManager.getTest()) === 'testone article atmod bt');

    const repm: any = await appCtx.getAsync(
      '@midway-plugin-mod:replaceManager'
    );
    assert((await repm.getOne()) === 'one article mod');
    mm.restore();
  });


  it('should load configuration with object', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration-object/base-app-decorator/src'
      ),
    });

    const appCtx = framework.getApplicationContext();
    // 取默认 namespace
    const replaceManager1: any = await appCtx.getAsync(
      'replaceManager'
    );
    expect(await replaceManager1.getOne()).toEqual('one article');
    // 取自定义 namespace
    const replaceManager2: any = await appCtx.getAsync('@ok:replaceManager');
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
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-conflict/base-app-decorator/src'
      ),
    });
    const appCtx = framework.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert.ok((await baseService.getInformation()) === 'this is conflict');
  });

  describe('test load different env', () => {
    afterEach(mm.restore);

    it('load default env', async () => {
      mm(process.env, 'NODE_ENV', '');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();
      const value = applicationContext.getConfigService().getConfiguration();
      assert(value['env'] === 'prod');
      assert(value['bbb'] === '111');
    });

    it('load prod env', async () => {
      mm(process.env, 'NODE_ENV', 'prod');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'prod');
    });

    it('load daily env', async () => {
      mm(process.env, 'NODE_ENV', 'daily');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
      });
      const applicationContext = framework.getApplicationContext();

      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'daily');
    });

    it('load pre env', async () => {
      mm(process.env, 'NODE_ENV', 'pre');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();

      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'pre');
    });

    it('load local env', async () => {
      mm(process.env, 'NODE_ENV', 'local');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();

      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'local');
    });
  });

  describe('test load different env by load directory', () => {
    afterEach(mm.restore);

    it('load default env', async () => {
      mm(process.env, 'NODE_ENV', '');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();

      const value = applicationContext.getConfigService().getConfiguration();
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
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();

      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'prod');
    });

    it('load daily env', async () => {
      mm(process.env, 'NODE_ENV', 'daily');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();

      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'daily');
    });

    it('load pre env', async () => {
      mm(process.env, 'NODE_ENV', 'pre');
      mm(process.env, 'MIDWAY_SERVER_ENV', '');
      const framework = new LightFramework();
      await framework.initialize({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
      });

      const applicationContext = framework.getApplicationContext();

      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'pre');
    });

  });

  it('should test aspect decorator', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/base-app-aspect/src'
      )
    });

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
  });

  it('should inject global value in component', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration-global-inject/base-app-decorator/src'
      )
    });

    const home: any = await framework.getApplicationContext().getAsync('SQL:home');
    expect(await home.getData()).toMatch(/base-app-decorator\/src\/bbbb\/dddd/);
  });

  it('should load component in different type and different env', async () => {
    mm(process.env, 'NODE_ENV', '');
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration-load/src'
      ),
    });

    const applicationContext = framework.getApplicationContext();

    const value = applicationContext.getConfigService().getConfiguration();
    expect(value['a']).toEqual(1);
    mm.restore();
  });

  it('lifecycle should be ok', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/base-app/src'
      ),
    });

    const container = framework.getApplicationContext();
    container.registerDataHandler(APPLICATION_KEY, () => {
      return { hello: 123 };
    });
    const cfg = container.createConfiguration();
    container.bind(TestBinding);
    cfg.bindConfigurationClass(LifeCycleTest);
    cfg.bindConfigurationClass(LifeCycleTest1);

    await framework.loadLifeCycles();

    const aa = await container.getAsync<LifeCycleTest>(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest');
    expect(aa.ts).toEqual('hello');
    expect(aa.ready).toBeTruthy();
    // container.registerObject('hellotest111', '12312312');
    expect(container.get('hellotest111')).toEqual('12312312');

    const aa1 = await container.getAsync<LifeCycleTest1>(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest1');
    expect(aa1.tts).toEqual('hello');
    expect(aa1.ready).toBeTruthy();

    const callback = sinon.spy();
    mm(console, 'log', (m) => {
      callback(m);
    });

    expect(container.registry.hasDefinition(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest')).toBeTruthy();
    await framework.stop();
    expect(container.registry.hasDefinition(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest')).toBeFalsy();
    expect(callback.withArgs('on stop').calledOnce).toBeTruthy();

    resetModule(CONFIGURATION_KEY);
    mm.restore();
  });

  it('should get service in a component write with app', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-custom-component-in-app/src'
      ),
    });

    const appCtx = framework.getApplicationContext();
    const userController = await appCtx.getAsync('userController');
    const books = await (userController as any).getBooksByUser();
    expect(books).toEqual([
      {
        "isbn": "9787115549440",
        "name": "无限可能"
      },
      {
        "isbn": "9787305236525",
        "name": "明智的孩子"
      },
      {
        "isbn": "9787020166916",
        "name": "伊卡狛格"
      }
    ]);
  });

  it('should create logger and match property between framework and app', async () => {
    const framework = new LightFramework();
    framework.configure({});
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/base-app-logger/src'
      ),
    });
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
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-functional-component/src'
      ),
    });

    await framework.stop();

    // const appCtx = framework.getApplicationContext();
  });

  it('should run multi framework in one process and use cache', async () => {
    const appMap = new Map();

    const framework1 = new LightFramework();
    framework1.configure({});
    await framework1.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/base-app-multi-framework-shared/src'
      ),
      isMainFramework: true,
      globalApplicationHandler: (type: MidwayFrameworkType) => {
        return appMap.get(type);
      }
    });

    class CustomTwoFramework extends LightFramework {
      async applicationInitialize(options: IMidwayBootstrapOptions) {
        this.app = {} as IMidwayApplication;
      }
      getFrameworkType(): MidwayFrameworkType {
        return MidwayFrameworkType.MS_GRPC;
      }
    }

    const framework2 = new CustomTwoFramework();
    framework2.configure({});
    await framework2.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/base-app-multi-framework-shared/src'
      ),
      isMainFramework: false,
      applicationContext: framework1.getApplicationContext(),
    });

    appMap.set(framework1.getFrameworkType(), framework1.getApplication());
    appMap.set(framework2.getFrameworkType(), framework2.getApplication());

    await framework1.loadLifeCycles(true);

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
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-component-inject-with-class/main/src'
      ),
    });

    const appCtx = framework.getApplicationContext();
    const userController = await appCtx.getAsync('userController');
    const books = await (userController as any).getBooksByUser();
    expect(books).toEqual([
      {
        "isbn": "9787115549440",
        "name": "无限可能"
      },
      {
        "isbn": "9787305236525",
        "name": "明智的孩子"
      },
      {
        "isbn": "9787020166916",
        "name": "伊卡狛格"
      }
    ]);
  });


  it('should test global framework', async () => {
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(__dirname, './fixtures/base-app/src'),
    });

    mm(global, 'MIDWAY_MAIN_FRAMEWORK', framework);

    const appCtx = framework.getApplicationContext();
    expect(getCurrentMainFramework()).toEqual(framework);
    expect(getCurrentApplicationContext()).toEqual(appCtx);
    expect(getCurrentMainApp()).toEqual(framework.getApplication());

    mm.restore();
  });

});
