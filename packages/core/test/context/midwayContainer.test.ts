import * as path from 'path';
import { MidwayContainer, MidwayRequestContainer, DirectoryFileDetector, MidwayLoggerService } from '../../src';
import { App } from '../fixtures/ts-app-inject/app';
import { TestCons } from '../fixtures/ts-app-inject/test';
import { APPLICATION_KEY, clearAllModule, CONFIG_KEY, LOGGER_KEY, PLUGIN_KEY } from '@midwayjs/decorator';
import * as assert from 'assert';
import {
  MidwayConfigService,
  MidwayEnvironmentService,
  MidwayFrameworkService,
  MidwayInformationService
} from '../../src';

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

    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayFrameworkService, [
      container
    ]);

    // register handler for container
    frameworkService.registerPropertyHandler(CONFIG_KEY, (key, meta, target) => {
      assert(
        target instanceof
        require('../fixtures/base-app-decorator/src/lib/service')[
          'BaseService'
          ]
      );
      return 'hello';
    });

    frameworkService.registerPropertyHandler(PLUGIN_KEY, (key, meta) => {
      return { b: 2 };
    });

    frameworkService.registerPropertyHandler(LOGGER_KEY, (key, meta) => {
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
    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayFrameworkService, [
      container
    ]);

    frameworkService.registerPropertyHandler(APPLICATION_KEY, () => tt);
    // register handler for container
    frameworkService.registerPropertyHandler(CONFIG_KEY, (key, meta, target) => {
      assert(
        target instanceof
        require('../fixtures/base-app-forbindapp/src/lib/service')[
          'BaseService'
          ]
      );
      return 'hello';
    });

    frameworkService.registerPropertyHandler(PLUGIN_KEY, (key, target) => {
      return { b: 2 };
    });

    frameworkService.registerPropertyHandler(LOGGER_KEY, (key, target) => {
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
    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayFrameworkService, [
      container
    ]);
    // register handler for container
    frameworkService.registerPropertyHandler(CONFIG_KEY, key => {
      return { c: 60 };
    });

    frameworkService.registerPropertyHandler(PLUGIN_KEY, key => {
      return { text: 2 };
    });

    frameworkService.registerPropertyHandler(LOGGER_KEY, key => {
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
    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayFrameworkService, [
      container
    ]);
    // register handler for container
    frameworkService.registerPropertyHandler(CONFIG_KEY, key => {
      return { c: 60 };
    });

    frameworkService.registerPropertyHandler(PLUGIN_KEY, key => {
      return { text: 2 };
    });

    frameworkService.registerPropertyHandler(LOGGER_KEY, key => {
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
  });

});
