import * as path from 'path';
import {
  MidwayContainer,
  MidwayRequestContainer,
  CommonJSFileDetector,
  MidwayLoggerService,
  MidwayConfigService,
  MidwayEnvironmentService,
  MidwayFrameworkService,
  MidwayInformationService,
  MidwayDecoratorService,
  MidwayAspectService,
  APPLICATION_KEY,
  clearAllModule,
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
  Provide,
  Scope,
  ScopeEnum,
  Inject,
  LazyInject,
  MidwayPriorityManager,
  MidwayApplicationManager
} from '../../src';
import { App } from '../fixtures/ts-app-inject/app';
import { TestCons } from '../fixtures/ts-app-inject/test';
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
  });

  it('should create new loader', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new CommonJSFileDetector({
      loadDir: buildLoadDir(['app', 'lib', '../test_other'], path.join(__dirname, '../fixtures/base-app/src')),
    }));
    await container.ready();
    assert.ok(typeof (await container.getAsync('testOther')));
  });

  it('should load ts file and use config, plugin decorator', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new CommonJSFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-decorator/src')
    }));

    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.bind(MidwayAspectService);
    container.bind(MidwayDecoratorService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    // register handler for container
    frameworkService.registerPropertyHandler(CONFIG_KEY, (key, meta, target) => {
      assert.ok(
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
    assert.ok(baseService.config === 'hello');
    assert.ok(baseService.logger === console);
    assert.ok(baseService.plugin2.b === 2);

    const context = { logger: console };
    const requestCtx = new MidwayRequestContainer(context, appCtx);
    const baseServiceCtx = await requestCtx.getAsync('baseService');
    const baseServiceCtx1 = await requestCtx.getAsync('baseService');
    assert.ok(baseServiceCtx === baseServiceCtx1);
    assert.ok(baseServiceCtx.config === 'hello');
    assert.ok(baseServiceCtx.logger === console);
    assert.ok(baseServiceCtx.plugin2.b === 2);
  });

  it('should load ts file and bindapp success', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new CommonJSFileDetector({
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
    container.bind(MidwayAspectService);
    container.bind(MidwayDecoratorService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    frameworkService.registerPropertyHandler(APPLICATION_KEY, () => tt);
    // register handler for container
    frameworkService.registerPropertyHandler(CONFIG_KEY, (key, meta, target) => {
      assert.ok(
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
    assert.ok(baseService.config === 'hello');
    assert.ok(baseService.logger === console);
    assert.ok(baseService.plugin2.b === 2);
    assert.ok(baseService.test.getBaseDir() === 'hello this is basedir');
  });

  it('load ts file support constructor inject', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new CommonJSFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-constructor/src'),
    }));
    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.bind(MidwayAspectService);
    container.bind(MidwayDecoratorService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayDecoratorService, [
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
    assert.ok(baseServiceCtx.config.c === 120);
    assert.ok(baseServiceCtx.plugin2.text === 2);
    assert.ok(baseServiceCtx.logger === console);
  });

  it('should auto load function file and inject by function name', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new CommonJSFileDetector({
      loadDir: path.join(__dirname, '../fixtures/base-app-function/src'),
    }));
    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.bind(MidwayAspectService);
    container.bind(MidwayDecoratorService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayDecoratorService, [
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
    assert.ok(baseServiceCtx.factory('google'));
  });

  it('should scan app dir and inject automatic', async () => {
    const container = new MidwayContainer();
    container.setFileDetector(new CommonJSFileDetector({
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


  it('should test throw error with class name', async () => {

    @Provide()
    class NoBindClass {}
    const container = new MidwayContainer();

    let error;
    try {
      await container.getAsync(NoBindClass);
    } catch (err) {
      error = err;
    }
    expect(error.message).toEqual('Definition for "NoBindClass" not found in current context.');

    try {
      container.get(NoBindClass);
    } catch (err) {
      error = err;
    }
    expect(error.message).toEqual('Definition for "NoBindClass" not found in current context.');
  });

  describe('test @LazyInject()', () => {
    it('should test circular should be ok', async () => {
      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularTwo {
        @Inject('circularOne')
        public ooo;
        constructor() {
          this.ts = Date.now();
        }
        @Inject()
        public circularOne: any;
        public ts: number;

        public test2 = 'this is two';

        public async ctest2(a: any): Promise<any> {
          return a + (await this.circularOne.ctest1('two'));
        }

        public ttest2(b: any) {
          return b + this.circularOne.test2('two');
        }
      }

      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularOne {
        constructor() {
          this.ts = Date.now();
        }
        @LazyInject()
        public circularTwo: any;
        public ts: number;

        public test1 = 'this is one';

        public async ctest1(a: any): Promise<any> {
          return a + 'one';
        }

        public test2(b: any) {
          return b + 'one';
        }
      }

      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularThree {
        constructor() {
          this.ts = Date.now();
        }
        @Inject()
        public circularTwo: any;
        public ts: number;
      }
      const container = new MidwayContainer();

      container.bind(MidwayFrameworkService);
      container.bind(MidwayConfigService);
      container.bind(MidwayLoggerService);
      container.bind(MidwayEnvironmentService);
      container.bind(MidwayInformationService);
      container.bind(MidwayAspectService);
      container.bind(MidwayDecoratorService);
      container.bind(MidwayPriorityManager);
      container.bind(MidwayApplicationManager);
      container.registerObject('appDir', '');
      container.registerObject('baseDir', '');
      container.bind(CircularOne);
      container.bind(CircularTwo);
      container.bind(CircularThree);

      await container.getAsync(MidwayDecoratorService, [
        container
      ]);

      await container.getAsync(MidwayFrameworkService, [
        container
      ]);

      container.registerObject('ctx', {});

      const circularTwo: CircularTwo = await container.getAsync(CircularTwo);
      const circularThree: CircularThree = await container.getAsync(CircularThree);

      expect(circularTwo.test2).toEqual('this is two');
      expect((circularTwo.circularOne as CircularOne).test1).toEqual('this is one');
      expect(((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).test2).toEqual('this is two');
      expect(circularThree.circularTwo.test2).toEqual('this is two');
      expect(circularTwo.ts).toEqual(((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).ts);
      expect(circularTwo.ttest2('try ttest2')).toEqual('try ttest2twoone');
      expect(await circularTwo.ctest2('try ttest2')).toEqual('try ttest2twoone');
      expect(await ((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).ctest2('try ttest2')).toEqual('try ttest2twoone');

      const circularTwoSync: CircularTwo = container.get(CircularTwo);
      const circularOneSync: CircularOne = container.get(CircularOne);

      expect(circularTwoSync.test2).toEqual('this is two');
      expect(circularOneSync.test1).toEqual('this is one');
      expect(circularTwoSync.ttest2('try ttest2')).toEqual('try ttest2twoone');
      expect(await circularTwoSync.ctest2('try ttest2')).toEqual('try ttest2twoone');
    });

    it('alias circular should be ok', async () => {
      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularTwo {
        @Inject('circularOne')
        public ooo;
        constructor() {
          this.ts = Date.now();
        }
        @Inject()
        public circularOne: any;
        public ts: number;

        public test2 = 'this is two';

        public async ctest2(a: any): Promise<any> {
          return a + (await this.circularOne.ctest1('two'));
        }

        public ttest2(b: any) {
          return b + this.circularOne.test2('two');
        }
      }

      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularOne {
        constructor() {
          this.ts = Date.now();
        }
        @LazyInject()
        public circularTwo: any;
        public ts: number;

        public test1 = 'this is one';

        public async ctest1(a: any): Promise<any> {
          return a + 'one';
        }

        public test2(b: any) {
          return b + 'one';
        }
      }

      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularThree {
        constructor() {
          this.ts = Date.now();
        }
        @Inject()
        public circularTwo: any;
        public ts: number;
      }
      @Provide()
      class TestOne1 {
        name = 'one';

        @Inject('testTwo1')
        two: any;
      }
      @Provide()
      class TestTwo1 {
        name = 'two';

        @LazyInject('testOne1')
        testOne: any;
      }
      @Provide()
      class TestThree1 {
        name = 'three';

        @Inject('testTwo1')
        two: any;
      }

      const container = new MidwayContainer();

      container.bind(MidwayFrameworkService);
      container.bind(MidwayConfigService);
      container.bind(MidwayLoggerService);
      container.bind(MidwayEnvironmentService);
      container.bind(MidwayInformationService);
      container.bind(MidwayAspectService);
      container.bind(MidwayDecoratorService);
      container.bind(MidwayPriorityManager);
      container.bind(MidwayApplicationManager);
      container.registerObject('appDir', '');
      container.registerObject('baseDir', '');
      container.bind(CircularOne);
      container.bind(CircularTwo);
      container.bind(CircularThree);
      container.bind(TestOne1);
      container.bind(TestTwo1);
      container.bind(TestThree1);

      await container.getAsync(MidwayDecoratorService, [
        container
      ]);

      await container.getAsync(MidwayFrameworkService, [
        container
      ]);
      container.registerObject('ctx', {});

      const circularTwo: CircularTwo = await container.getAsync(CircularTwo);
      expect(circularTwo.test2).toEqual('this is two');
      expect((circularTwo.circularOne as CircularOne).test1).toEqual('this is one');
      expect(((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).test2).toEqual('this is two');

      const one = await container.getAsync<TestOne1>(TestOne1);
      expect(one).toBeDefined();
      expect(one).toBeDefined();
      expect(one.name).toEqual('one');
      expect((one.two as TestTwo1).name).toEqual('two');
    });

    it('sync circular should be ok', async () => {
      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularTwo {
        @Inject('circularOne')
        public ooo;
        constructor() {
          this.ts = Date.now();
        }
        @Inject()
        public circularOne: any;
        public ts: number;

        public test2 = 'this is two';

        public async ctest2(a: any): Promise<any> {
          return a + (await this.circularOne.ctest1('two'));
        }

        public ttest2(b: any) {
          return b + this.circularOne.test2('two');
        }
      }

      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularOne {
        constructor() {
          this.ts = Date.now();
        }
        @LazyInject(() => CircularTwo)
        public circularTwo: CircularTwo;
        public ts: number;

        public test1 = 'this is one';

        public async ctest1(a: any): Promise<any> {
          return a + 'one';
        }

        public test2(b: any) {
          return b + 'one';
        }
      }

      @Provide()
      @Scope(ScopeEnum.Request)
      class CircularThree {
        constructor() {
          this.ts = Date.now();
        }
        @Inject()
        public circularTwo: any;
        public ts: number;
      }
      const container = new MidwayContainer();

      container.bind(MidwayFrameworkService);
      container.bind(MidwayConfigService);
      container.bind(MidwayLoggerService);
      container.bind(MidwayEnvironmentService);
      container.bind(MidwayInformationService);
      container.bind(MidwayAspectService);
      container.bind(MidwayDecoratorService);
      container.bind(MidwayPriorityManager);
      container.bind(MidwayApplicationManager);
      container.registerObject('appDir', '');
      container.registerObject('baseDir', '');
      container.bind(CircularOne);
      container.bind(CircularTwo);
      container.bind(CircularThree);

      await container.getAsync(MidwayDecoratorService, [
        container
      ]);

      await container.getAsync(MidwayFrameworkService, [
        container
      ]);

      container.registerObject('ctx', {});

      const circularTwo: CircularTwo = container.get(CircularTwo);
      const circularThree: CircularThree = container.get(CircularThree);

      expect(circularTwo.test2).toEqual('this is two');
      expect((circularTwo.circularOne as CircularOne).test1).toEqual('this is one');
      expect(((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).test2).toEqual('this is two');
      expect(circularThree.circularTwo.test2).toEqual('this is two');
      expect(circularTwo.ts).toEqual(((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).ts);
      expect(circularTwo.ttest2('try ttest2')).toEqual('try ttest2twoone');
      expect(await circularTwo.ctest2('try ttest2')).toEqual('try ttest2twoone');
      expect(await ((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo).ctest2('try ttest2')).toEqual('try ttest2twoone');
    });
  });

});
