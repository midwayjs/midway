import {
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
  Provide,
  APPLICATION_KEY,
} from '@midwayjs/decorator';
import * as assert from 'assert';
import * as path from 'path';
import {
  ContainerLoader,
  MidwayRequestContainer,
  clearAllModule,
} from '../src';
import * as mm from 'mm';
import sinon = require('sinon');

@Provide()
class TestModule {
  test() {
    return 'hello';
  }
}

describe('/test/loader.test.ts', () => {
  beforeEach(() => {
    clearAllModule();
  });
  it('should create new loader', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app/src'),
    });
    loader.initialize();
    loader.loadDirectory({
      loadDir: ['app', 'lib', '../test_other'],
    });
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const pluginCtx = loader.getPluginContext();

    assert(appCtx);
    assert(pluginCtx);

    assert.ok(typeof (await appCtx.getAsync('testOther')));
  });

  it('should load ts file and use config, plugin decorator', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-decorator/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    // register handler for container
    loader.registerHook(CONFIG_KEY, (key, target) => {
      assert(
        target instanceof
          require('./fixtures/base-app-decorator/src/lib/service')[
            'BaseService'
          ]
      );
      return 'hello';
    });

    loader.registerHook(PLUGIN_KEY, (key, target) => {
      return { b: 2 };
    });

    loader.registerHook(LOGGER_KEY, (key, target) => {
      return console;
    });

    const appCtx = loader.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert(baseService.config === 'hello');
    assert(baseService.logger === console);
    assert(baseService.plugin2.b === 2);

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(context, appCtx);
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    const baseServiceCtx1 = await requestCtx.getAsync('baseService');
    assert(baseServiceCtx === baseServiceCtx1);
    assert(baseServiceCtx.config === 'hello');
    assert(baseServiceCtx.logger === console);
    assert(baseServiceCtx.plugin2.b === 2);
  });

  it('should load ts file and bindapp success', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-forbindapp/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    const tt: any = {
      getBaseDir() { return 'hello this is basedir'; }
    };
    loader.registerHook(APPLICATION_KEY, () => tt);
    await loader.refresh();
    // register handler for container
    loader.registerHook(CONFIG_KEY, (key, target) => {
      assert(
        target instanceof
          require('./fixtures/base-app-forbindapp/src/lib/service')[
            'BaseService'
          ]
      );
      return 'hello';
    });

    loader.registerHook(PLUGIN_KEY, (key, target) => {
      return { b: 2 };
    });

    loader.registerHook(LOGGER_KEY, (key, target) => {
      return console;
    });

    const appCtx = loader.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert(baseService.config === 'hello');
    assert(baseService.logger === console);
    assert(baseService.plugin2.b === 2);
    assert(baseService.test.getBaseDir() === 'hello this is basedir');
  });

  it('load ts file support constructor inject', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-constructor/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    // register handler for container
    loader.registerHook(CONFIG_KEY, key => {
      return { c: 60 };
    });

    loader.registerHook(PLUGIN_KEY, key => {
      return { text: 2 };
    });

    loader.registerHook(LOGGER_KEY, key => {
      return console;
    });

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(
      context,
      loader.getApplicationContext()
    );
    const module = require(path.join(
      __dirname,
      './fixtures/base-app-constructor/src/lib/service'
    ));
    const baseServiceCtx = await requestCtx.getAsync(module['BaseService']);
    assert(baseServiceCtx.config.c === 120);
    assert(baseServiceCtx.plugin2.text === 2);
    assert(baseServiceCtx.logger === console);
  });

  it('should auto load function file and inject by function name', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-function/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    // register handler for container
    loader.registerHook(CONFIG_KEY, key => {
      return { c: 60 };
    });

    loader.registerHook(PLUGIN_KEY, key => {
      return { text: 2 };
    });

    loader.registerHook(LOGGER_KEY, key => {
      return console;
    });

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(
      context,
      loader.getApplicationContext()
    );
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    assert(baseServiceCtx.factory('google'));
  });

  it('should load js directory and auto disable', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/js-app-loader'),
      isTsMode: false,
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();
    const appCtx = loader.getApplicationContext();
    try {
      await appCtx.getAsync('app');
    } catch (err) {
      assert(err);
    }
  });

  it('should load preload module', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app/src'),
      preloadModules: [TestModule],
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const module: any = await appCtx.getAsync('testModule');
    assert(module.test() === 'hello');
  });

  it('should load configuration', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      ),
    });
    loader.initialize();
    loader.loadDirectory();
    loader.registerHook(APPLICATION_KEY, () => ({
      getBaseDir() {
        return 'base dir';
      }
    }));
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert((await baseService.getInformation()) === 'harry,one article');
    assert.equal(baseService.getAaa(), 123);
    assert.equal(baseService.getCcc(), 'mock');
  });

  it('should load config.*.ts by default env', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      ),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok');
  });

  it('should load config.*.ts by process.env', async () => {
    mm(process.env, 'NODE_ENV', 'local');
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      ),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok1');
    mm.restore();
  });

  it('should load config.*.ts by process.env MIDWAY_SERVER_ENV', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const callback = sinon.spy();
    mm(console, 'log', m => {
      callback(m);
    });
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-decorator/src'
      ),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('@ok:replaceManager');
    assert((await replaceManager.getOne()) === 'ok1');
    assert.ok(
      callback.withArgs('------auto configuration ready now').calledOnce
    );
    mm.restore();
  });

  it('should load with no package.json', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration/base-app-no-package-json/src'
      ),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
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
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration-namespace/base-app-decorator/src'
      ),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
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
    expect(await baseService.getInformation()).toEqual( 'harryone article atmod,one article,ok3');

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

  it('should load conflict with error', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-conflict/base-app-decorator/src'
      ),
      disableConflictCheck: false,
    });
    loader.initialize();
    const callback = sinon.spy();
    try {
      loader.loadDirectory();
      await loader.refresh();
    } catch (e) {
      callback(e.message);
    }
    const p = path.resolve(
      __dirname,
      './fixtures/app-with-conflict/base-app-decorator/src/lib/'
    );
    const s = `baseService path = ${p}/userManager.ts is exist (${p}/service.ts)!`;
    assert.ok(callback.withArgs(s).calledOnce);
  });

  it('should load conflict without error', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-conflict/base-app-decorator/src'
      ),
      disableConflictCheck: true,
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert.ok((await baseService.getInformation()) === 'this is conflict');
  });

  describe('test load different env', () => {
    afterEach(mm.restore);

    it('load default env', async () => {
      mm(process.env, 'NODE_ENV', '');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext.getConfigService().getConfiguration();
      assert(value['env'] === 'prod');
      assert(value['bbb'] === '111');
    });

    it('load prod env', async () => {
      mm(process.env, 'NODE_ENV', 'prod');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'prod');
    });

    it('load daily env', async () => {
      mm(process.env, 'NODE_ENV', 'daily');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'daily');
    });

    it('load pre env', async () => {
      mm(process.env, 'NODE_ENV', 'pre');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'pre');
    });

    it('load local env', async () => {
      mm(process.env, 'NODE_ENV', 'local');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
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
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
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
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'prod');
    });

    it('load daily env', async () => {
      mm(process.env, 'NODE_ENV', 'daily');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'daily');
    });

    it('load pre env', async () => {
      mm(process.env, 'NODE_ENV', 'pre');
      const loader = new ContainerLoader({
        baseDir: path.join(
          __dirname,
          './fixtures/app-with-configuration-config-dir/src'
        ),
        disableConflictCheck: true,
      });
      loader.initialize();
      loader.loadDirectory();
      await loader.refresh();
      const applicationContext = loader.getApplicationContext();
      const value = applicationContext
        .getConfigService()
        .getConfiguration('env');
      assert(value === 'pre');
    });

  });

  it('should test aspect decorator', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/base-app-aspect/src'
      )
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const home: any = await loader.getApplicationContext().getAsync('home');
    expect(home.hello()).toEqual('hello worlddddfff');
    expect(await home.hello1()).toEqual('hello world 1');
    expect(await home.hello2()).toEqual('hello worldcccppp');
  });

  it('should inject global value in component', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-configuration-global-inject/base-app-decorator/src'
      )
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const home: any = await loader.getApplicationContext().getAsync('SQL:home');
    expect(await home.getData()).toMatch(/base-app-decorator\/src\/bbbb/);
  });
});
