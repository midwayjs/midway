import { Bootstrap } from '../src';
import {
  IMidwayFramework,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer, IConfigurationOptions, MidwayFrameworkType,
} from '@midwayjs/core';

class TestFrameworkUnit implements IMidwayFramework<any, IConfigurationOptions> {
  configurationOptions: IConfigurationOptions;
  options;
  app;

  configure(options: IConfigurationOptions): TestFrameworkUnit {
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
}

describe('/test/index.test.ts', () => {
  it('create case', async () => {
    const bootstrap = Bootstrap.configure({
      baseDir: __dirname,
    });

    expect(bootstrap);

    const framework = new TestFrameworkUnit().configure({
      port: 7001,
    });
    await bootstrap.load(framework).run();
    expect(framework);
    expect(framework.getApplicationContext()).toStrictEqual({a: 1});
    expect(framework.app).toStrictEqual({bbb: 22});
    expect(framework.getApplication()).toStrictEqual({bbb: 22});


    // Bootstrap.configure({})
    //   .load(new TestFrameworkUnit().configure({port: 7001}))
    //   .run();
  });
});
