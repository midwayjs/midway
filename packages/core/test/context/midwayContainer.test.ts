import { expect } from 'chai';

import * as path from 'path';
import { clearAllModule, MidwayContainer, MidwayRequestContainer } from '../../src';
import { App } from '../fixtures/ts-app-inject/app';
import { TestCons } from '../fixtures/ts-app-inject/test';
import * as decs from '@midwayjs/decorator';
import { CONFIG_KEY, LOGGER_KEY, PLUGIN_KEY } from '@midwayjs/decorator';
import * as assert from 'assert';

const { APPLICATION_KEY } = decs;

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
    MidwayContainer.parentDefinitionMetadata = null;
  });

  it('should create new loader', async () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: buildLoadDir(['app', 'lib', '../test_other'], path.join(__dirname, '../fixtures/base-app/src')),
    });
    assert.ok(typeof (await container.getAsync('testOther')));
  });

  it('should load ts file and use config, plugin decorator', async () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, '../fixtures/base-app-decorator/src')
    });
    // register handler for container
    container.registerDataHandler(CONFIG_KEY, (key, target) => {
      assert(
        target instanceof
        require('../fixtures/base-app-decorator/src/lib/service')[
          'BaseService'
          ]
      );
      return 'hello';
    });

    container.registerDataHandler(PLUGIN_KEY, (key, target) => {
      return { b: 2 };
    });

    container.registerDataHandler(LOGGER_KEY, (key, target) => {
      return console;
    });

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
    container.load({
      loadDir: path.join(__dirname, '../fixtures/base-app-forbindapp/src')
    });

    const tt: any = {
      getBaseDir() {
        return 'hello this is basedir';
      }
    };
    container.registerDataHandler(APPLICATION_KEY, () => tt);
    await container.ready();
    // register handler for container
    container.registerDataHandler(CONFIG_KEY, (key, target) => {
      assert(
        target instanceof
        require('../fixtures/base-app-forbindapp/src/lib/service')[
          'BaseService'
          ]
      );
      return 'hello';
    });

    container.registerDataHandler(PLUGIN_KEY, (key, target) => {
      return { b: 2 };
    });

    container.registerDataHandler(LOGGER_KEY, (key, target) => {
      return console;
    });

    const appCtx = container;
    const baseService: any = await appCtx.getAsync('baseService');
    assert(baseService.config === 'hello');
    assert(baseService.logger === console);
    assert(baseService.plugin2.b === 2);
    assert(baseService.test.getBaseDir() === 'hello this is basedir');
  });

  it('load ts file support constructor inject', async () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, '../fixtures/base-app-constructor/src'),
    });

    await container.ready();

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

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(
      context,
      container
    );
    const module = require(path.join(
      __dirname,
      '../fixtures/base-app-constructor/src/lib/service'
    ));
    const baseServiceCtx = await requestCtx.getAsync(module['BaseService']);
    assert(baseServiceCtx.config.c === 120);
    assert(baseServiceCtx.plugin2.text === 2);
    assert(baseServiceCtx.logger === console);
  });

  it('should auto load function file and inject by function name', async () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, '../fixtures/base-app-function/src'),
    });

    await container.ready();

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

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(
      context,
      container
    );
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    assert(baseServiceCtx.factory('google'));
  });

  it('should scan app dir and inject automatic', () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, '../fixtures/ts-app-inject')
    });

    (decs as any).throwErrorForTest(decs.CLASS_KEY_CONSTRUCTOR, new Error('mock error'));

    const tt = container.get<TestCons>('testCons');
    expect(tt.ts).gt(0);

    (decs as any).throwErrorForTest(decs.CLASS_KEY_CONSTRUCTOR);

    const app = container.get('app') as App;
    expect(app.loader).not.to.be.undefined;
    expect(app.getConfig().a).to.equal(3);
    // 其实这里循环依赖了
    expect(app.easyLoader.getConfig().a).to.equal(1);

    expect(container.getEnvironmentService()).is.not.undefined;
    expect(container.getEnvironmentService().getCurrentEnvironment()).eq('test');

    const subContainer = container.createChild();
    const sapp = subContainer.get('app') as App;
    expect(sapp.loader).not.to.be.undefined;
    expect(sapp.getConfig().a).to.equal(3);
  });

});
