import { Bootstrap } from '../src';
import {
  IMidwayFramework,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IConfigurationOptions,
  MidwayFrameworkType,
} from '@midwayjs/core';
import { clearAllLoggers, MidwayContextLogger } from '@midwayjs/logger';
import { join } from 'path';

interface MockConfigurationOptions extends IConfigurationOptions {
  port?: number;
}

export const sleep = async (timeout = 1000) => {
  return new Promise<void>(resolve =>  {
    setTimeout(resolve, timeout);
  });
}

class TestFrameworkUnit implements IMidwayFramework<any, MockConfigurationOptions> {
  configurationOptions: MockConfigurationOptions;
  bootstrapOptions: IMidwayBootstrapOptions;
  options;
  app;

  configure(options: MockConfigurationOptions): TestFrameworkUnit {
    this.options = options;
    return this;
  }

  async run(): Promise<any> {
    return 'bbb';
  }

  async stop(): Promise<void> {
  }

  async initialize(options: IMidwayBootstrapOptions): Promise<void> {
    this.app = {bbb: 22};
    this.bootstrapOptions = options;
  }

  getApplicationContext(): IMidwayContainer {
    return {a: 1} as any;
  }

  getApplication(): IMidwayApplication {
    return this.app;
  }

  getConfiguration(key?: string) {
    return {}
  }

  getCurrentEnvironment(): string {
    return 'prod'
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.CUSTOM;
  }

  getAppDir(): string {
    return this.bootstrapOptions.appDir;
  }

  getBaseDir(): string {
    return this.bootstrapOptions.baseDir;
  }

  getLogger(): any {
    return console;
  }

  getCoreLogger(): any {
    return console;
  }

  createLogger(name: string, options) {
    return console;
  }

  getProjectName(): string {
    return 'test';
  }

  getFrameworkName() {
    return 'midway:mock'
  }

  getDefaultContextLoggerClass() {
    return MidwayContextLogger
  }
}

describe('/test/index.test.ts', () => {

  beforeEach(() => {
    Bootstrap.reset();
    clearAllLoggers();
  })

  it('create bootstrap case', async () => {
    process.env.MIDWAY_TS_MODE = 'true';
    const bootstrap = Bootstrap.configure({
      appDir: __dirname,
    });

    expect(bootstrap);

    const framework = new TestFrameworkUnit().configure({
      port: 7001,
    });
    await bootstrap.load(framework).run();
    expect(framework);
    expect(framework.getAppDir()).toEqual(__dirname);
    expect(framework.getBaseDir()).toEqual(join(__dirname, 'src'));
    expect(framework.getApplicationContext()).toStrictEqual({a: 1});
    expect(framework.app).toStrictEqual({bbb: 22});
    expect(framework.getApplication()).toStrictEqual({bbb: 22});


    // Bootstrap.configure({})
    //   .load(new TestFrameworkUnit().configure({port: 7001}))
    //   .run();
    await bootstrap.stop();
    process.env.MIDWAY_TS_MODE = '';
    // await bootstrap.reset();
  });

  it('should bootstrap with no console', async () => {
    const bootstrap = Bootstrap.configure({
      appDir: __dirname,
      logger: false
    });
    expect(bootstrap);
    await bootstrap.run();
    await bootstrap.stop();
  });

  it('should start bootstrap with not configure', async () => {
    const framework = new TestFrameworkUnit().configure({
      port: 7001,
    });
    await Bootstrap.load(framework).run();
    expect(framework.getAppDir()).toEqual(process.cwd());
    // 因为 jest 环境认不出 ts-node
    expect(framework.getBaseDir()).toEqual(join(process.cwd(), 'dist'));
    await Bootstrap.stop();
  });

  it('should test bootstrap run with mock', async () => {
    global['MIDWAY_BOOTSTRAP_APP_SET'] = new Set();
    const framework = new TestFrameworkUnit().configure({});
    await Bootstrap.load(framework).run();
    expect(global['MIDWAY_BOOTSTRAP_APP_SET'].size).toEqual(1);
    await Bootstrap.stop();
    global['MIDWAY_BOOTSTRAP_APP_SET'] = null;
  });
});
