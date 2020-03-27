import {
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
  Provide,
} from '@midwayjs/decorator';
import * as assert from 'assert';
import * as path from 'path';
import { ContainerLoader, MidwayRequestContainer, clearAllModule } from '../src';
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
    mm(console, 'log', (m) => {
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
    assert.ok(callback.withArgs('------auto configuration ready now').calledOnce);
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
    assert((await replaceManager.getOne()) === 'ok1');
    const replaceManagerno: any = await appCtx.getAsync(
      '@midway-plugin-no-pkg-json:replaceManager'
    );
    assert((await replaceManagerno.getOne()) === 'ok1');
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
    assert((await replaceManager2.getOne()) === 'ok2');
    // 查看覆盖的情况
    const baseService: any = await appCtx.getAsync('baseService');
    assert(
      (await baseService.getInformation()) ===
        'harryone article atmod,one article,ok2'
    );

    assert(baseService.helloworld === 234);

    assert(baseService.articleManager1);
    assert(await baseService.articleManager1.getOne() === 'ok2empty');

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
    });
    loader.initialize();
    const callback = sinon.spy();
    try {
      loader.loadDirectory();
      await loader.refresh();
    } catch (e) {
      callback(e.message);
    }
    const s = 'baseService path = /Users/kurten/workspace/nodejs/midway-open/packages/midway-core/test/fixtures/app-with-conflict/base-app-decorator/src/lib/userManager.ts is exist (/Users/kurten/workspace/nodejs/midway-open/packages/midway-core/test/fixtures/app-with-conflict/base-app-decorator/src/lib/service.ts)!';
    assert.ok(callback.withArgs(s).calledOnce);
  });

  it('should load conflict without error', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(
        __dirname,
        './fixtures/app-with-conflict/base-app-decorator/src'
      ),
      disableConflictCheck: true
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert.ok(await baseService.getInformation() === 'this is conflict');
  });
});
