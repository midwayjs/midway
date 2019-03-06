import { CONFIG_KEY, LOGGER_KEY, PLUGIN_KEY } from '@midwayjs/decorator';
import * as assert from 'assert';
import * as path from 'path';
import { ContainerLoader } from '../src';

describe('/test/loader.test.ts', () => {

  it('should create new loader', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app/src')
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    const appCtx = loader.getApplicationContext();
    const pluginCtx = loader.getPluginContext();
    const requestCtx = loader.getRequestContext();

    assert(pluginCtx);
    assert(requestCtx === await appCtx.getAsync('requestContext'));
  });

  it('should load ts file and use config, plugin decorator', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-decorator/src')
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    // register handler for container
    loader.registerAllHook(CONFIG_KEY, (key) => {
      return 'hello';
    });

    loader.registerAllHook(PLUGIN_KEY, (key) => {
      return {b: 2};
    });

    loader.registerAllHook(LOGGER_KEY, (key) => {
      return console;
    });

    const appCtx = loader.getApplicationContext();
    const baseService = await appCtx.getAsync('baseService');
    assert(baseService.config === 'hello');
    assert(baseService.logger === console);
    assert(baseService.plugin2.b === 2);

    const context = {logger: console};
    const requestCtx = loader.getRequestContext();
    requestCtx.updateContext(context);
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    const baseServiceCtx1 = await requestCtx.getAsync('baseService');
    assert(baseServiceCtx === baseServiceCtx1);
    assert(baseServiceCtx.config === 'hello');
    assert(baseServiceCtx.logger === console);
    assert(baseServiceCtx.plugin2.b === 2);
  });

  it('load ts file support constructor inject', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-constructor/src')
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    // register handler for container
    loader.registerAllHook(CONFIG_KEY, (key) => {
      return {c: 60};
    });

    loader.registerAllHook(PLUGIN_KEY, (key) => {
      return {text: 2};
    });

    loader.registerAllHook(LOGGER_KEY, (key) => {
      return console;
    });

    const context = {logger: console};
    const requestCtx = loader.getRequestContext();
    requestCtx.updateContext(context);
    const module = require(path.join(__dirname, './fixtures/base-app-constructor/src/lib/service'));
    const baseServiceCtx = await requestCtx.getAsync(module['BaseService']);
    assert(baseServiceCtx.config.c === 120);
    assert(baseServiceCtx.plugin2.text === 2);
    assert(baseServiceCtx.logger === console);
  });

  it('should auto load function file and inject by function name', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/base-app-function/src')
    });
    loader.initialize();
    loader.loadDirectory();
    await loader.refresh();

    // register handler for container
    loader.registerAllHook(CONFIG_KEY, (key) => {
      return {c: 60};
    });

    loader.registerAllHook(PLUGIN_KEY, (key) => {
      return {text: 2};
    });

    loader.registerAllHook(LOGGER_KEY, (key) => {
      return console;
    });

    const context = {logger: console};
    const requestCtx = loader.getRequestContext();
    requestCtx.updateContext(context);
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    assert(baseServiceCtx.factory('google'));
  });

  it('should load js directory and set auto load', async () => {
    const loader = new ContainerLoader({
      baseDir: path.join(__dirname, './fixtures/js-app-loader'),
      isTsMode: false,
    });
    loader.initialize();
    loader.loadDirectory({disableAutoLoad: false});
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

});
