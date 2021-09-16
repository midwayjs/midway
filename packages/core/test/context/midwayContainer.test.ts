import * as path from 'path';
import { MidwayContainer, MidwayRequestContainer, DirectoryFileDetector } from '../../src';
import { App } from '../fixtures/ts-app-inject/app';
import { TestCons } from '../fixtures/ts-app-inject/test';
import { APPLICATION_KEY, clearAllModule, CONFIG_KEY, LOGGER_KEY, PLUGIN_KEY } from '@midwayjs/decorator';
import * as assert from 'assert';

function buildLoadDir(arr, baseDir) {
  return arr.map(dir => {
    if (!path.isAbsolute(dir)) {
      return path.join(baseDir, dir);
    }
    return dir;
  });
}

describe('/test/context/midwayContainer.test.ts', () => {

  beforeEach(() => {
    clearAllModule();
    // MidwayContainer.parentDefinitionMetadata = null;
  });

  it('should create new loader', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: buildLoadDir(['app', 'lib', '../test_other'], path.join(__dirname, '../fixtures/base-app/src')),
    }));
    await container.ready();
    assert.ok(typeof (await container.getAsync('testOther')));
  });

  it('should load ts file and use config, plugin decorator', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-decorator/src')
    }));

    // register handler for container
    container.registerDataHandler(CONFIG_KEY, (key, meta, target) => {
      assert(
        target instanceof
        require('../fixtures/base-app-decorator/src/lib/service')[
          'BaseService'
          ]
      );
      return 'hello';
    });

    container.registerDataHandler(PLUGIN_KEY, (key, meta, target) => {
      return { b: 2 };
    });

    container.registerDataHandler(LOGGER_KEY, (key, meta, target) => {
      return console;
    });
    await container.ready();
    const appCtx = container;
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
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-forbindapp/src')
    }));

    const tt: any = {
      getBaseDir() {
        return 'hello this is basedir';
      }
    };
    container.registerDataHandler(APPLICATION_KEY, () => tt);
    // register handler for container
    container.registerDataHandler(CONFIG_KEY, (key, meta, target) => {
      assert(
        target instanceof
        require('../fixtures/base-app-forbindapp/src/lib/service')[
          'BaseService'
          ]
      );
      return 'hello';
    });

    container.registerDataHandler(PLUGIN_KEY, (key, meta, target) => {
      return { b: 2 };
    });

    container.registerDataHandler(LOGGER_KEY, (key, meta, target) => {
      return console;
    });
    await container.ready();
    const appCtx = container;
    const baseService: any = await appCtx.getAsync('baseService');
    assert(baseService.config === 'hello');
    assert(baseService.logger === console);
    assert(baseService.plugin2.b === 2);
    assert(baseService.test.getBaseDir() === 'hello this is basedir');
  });

  it('load ts file support constructor inject', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-constructor/src'),
    }));

    // register handler for container
    container.registerDataHandler(CONFIG_KEY, key => {
      return { c: 60 };
    });

    container.registerDataHandler(PLUGIN_KEY, key => {
      return { text: 2 };
    });

    container.registerDataHandler(LOGGER_KEY, key => {
      return console;
    });

    await container.ready();

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(
      context,
      container
    );
    const module = require('../fixtures/base-app-constructor/src/lib/service');
    const baseServiceCtx = await requestCtx.getAsync(module.BaseService);
    assert(baseServiceCtx.config.c === 120);
    assert(baseServiceCtx.plugin2.text === 2);
    assert(baseServiceCtx.logger === console);
  });

  it('should auto load function file and inject by function name', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-function/src'),
    }));

    // register handler for container
    container.registerDataHandler(CONFIG_KEY, key => {
      return { c: 60 };
    });

    container.registerDataHandler(PLUGIN_KEY, key => {
      return { text: 2 };
    });

    container.registerDataHandler(LOGGER_KEY, key => {
      return console;
    });

    await container.ready();

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(
      context,
      container
    );
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    assert(baseServiceCtx.factory('google'));
  });

  it('should scan app dir and inject automatic', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: path.join(__dirname, '../fixtures/ts-app-inject')
    }));

    await container.ready();

    const tt = container.get<TestCons>('testCons');
    expect(tt.ts).toBeGreaterThan(0);

    const app = container.get('app') as App;
    expect(app.loader).toBeDefined();
    expect(app.getConfig().a).toEqual(3);
    // 其实这里循环依赖了
    expect(app.easyLoader.getConfig().a).toEqual(1);

    expect(container.getEnvironmentService()).toBeDefined();
    expect(container.getEnvironmentService().getCurrentEnvironment()).toEqual('test');
  });

  it('should test autoload', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new DirectoryFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-autoload/src'),
    }));

    await container.ready();
    expect(container.registry.hasObject('userService')).toBeTruthy();
  });

});
