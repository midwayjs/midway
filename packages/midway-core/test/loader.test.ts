import {
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
  Provide,
} from '@midwayjs/decorator';
import * as assert from 'assert';
import * as path from 'path';
import { ContainerLoader, MidwayRequestContainer } from '../src';
import * as mm from 'mm';

@Provide()
class TestModule {
  test() {
    return 'hello';
  }
}

describe('/test/loader.test.ts', () => {
  it('should create new loader', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const pluginCtx = loader.getPluginContext();

    assert(appCtx);
    assert(pluginCtx);
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

  xit('should load js directory and set auto load', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/js-app-loader'),
      isTsMode: false,
    });
    loader.initialize();
    loader.loadDirectory({ disableAutoLoad: false });
    await loader.refresh();
    const appCtx = loader.getApplicationContext();
    assert(await appCtx.getAsync('app'));
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
      baseDir: path.join(__dirname, './fixtures/app-with-configuration/base-app-decorator/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const baseService: any = await appCtx.getAsync('baseService');
    assert(await baseService.getInformation() === 'harry,one article');
  });

  it('should load config.*.ts by default env', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/app-with-configuration/base-app-decorator/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('replaceManager');
    assert(await replaceManager.getOne() === 'ok');
  });

  it('should load config.*.ts by process.env', async () => {
    mm(process.env, 'NODE_ENV', 'local');
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/app-with-configuration/base-app-decorator/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('replaceManager');
    assert(await replaceManager.getOne() === 'ok1');
    mm.restore();
  });

  it('should load config.*.ts by process.env MIDWAY_SERVER_ENV', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'local');
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/app-with-configuration/base-app-decorator/src'),
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const replaceManager: any = await appCtx.getAsync('replaceManager');
    assert(await replaceManager.getOne() === 'ok1');
    mm.restore();
  });
});
