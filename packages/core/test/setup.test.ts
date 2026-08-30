import { join } from 'path';
import {
  BaseFramework,
  destroyGlobalApplicationContext,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
  MidwayConfigService,
  prepareGlobalApplicationContext,
  prepareGlobalApplicationContextAsync,
  Configuration,
  Framework,
  Inject,
} from '../src';

describe('/test/setup.test.ts', () => {
  const baseDir = join(__dirname, './fixtures/base-app-config/src');

  it('should load the conventional entry when bootstrap imports are omitted', async () => {
    const options: IMidwayBootstrapOptions = { baseDir };
    const container = await prepareGlobalApplicationContextAsync(options);
    const configService = await container.getAsync(MidwayConfigService);

    expect(options.imports).toHaveLength(1);
    expect(configService.getConfiguration()).toHaveProperty('hello');

    await container.stop();
  });

  it('should use explicit bootstrap imports without loading the conventional entry', async () => {
    const explicitModule = { explicitBootstrapImport: true };
    const options: IMidwayBootstrapOptions = {
      baseDir,
      imports: explicitModule,
    };
    const container = await prepareGlobalApplicationContextAsync(options);
    const configService = await container.getAsync(MidwayConfigService);

    expect(options.imports).toEqual([explicitModule]);
    expect(configService.getConfiguration()).not.toHaveProperty('hello');

    await container.stop();
  });

  it('should preserve an explicit bootstrap imports array', async () => {
    const explicitModule = { explicitBootstrapImportArray: true };
    const options: IMidwayBootstrapOptions = {
      baseDir,
      imports: [explicitModule],
    };
    const container = await prepareGlobalApplicationContextAsync(options);
    const configService = await container.getAsync(MidwayConfigService);

    expect(options.imports).toEqual([explicitModule]);
    expect(configService.getConfiguration()).not.toHaveProperty('hello');

    await container.stop();
  });

  it('should treat empty bootstrap imports as an explicit override', async () => {
    const options: IMidwayBootstrapOptions = { baseDir, imports: [] };
    const container = await prepareGlobalApplicationContextAsync(options);
    const configService = await container.getAsync(MidwayConfigService);

    expect(options.imports).toEqual([]);
    expect(configService.getConfiguration()).not.toHaveProperty('hello');

    await container.stop();
  });

  it('should apply the same bootstrap import semantics in sync setup', async () => {
    const explicitModule = { syncExplicitBootstrapImport: true };
    const explicitOptions: IMidwayBootstrapOptions = {
      baseDir,
      imports: explicitModule,
    };
    const explicitContainer = prepareGlobalApplicationContext(explicitOptions);
    const explicitConfigService = explicitContainer.get(MidwayConfigService);

    expect(explicitOptions.imports).toEqual([explicitModule]);
    expect(explicitConfigService.getConfiguration()).not.toHaveProperty(
      'hello'
    );

    await explicitContainer.stop();

    const defaultOptions: IMidwayBootstrapOptions = { baseDir };
    const defaultContainer = prepareGlobalApplicationContext(defaultOptions);
    const defaultConfigService = defaultContainer.get(MidwayConfigService);

    expect(defaultOptions.imports).toHaveLength(1);
    expect(defaultConfigService.getConfiguration()).toHaveProperty('hello');

    await defaultContainer.stop();
  });

  it('should test setup and config', async () => {
    const container = await initializeGlobalApplicationContext({
      baseDir,
      imports: [require(join(baseDir, 'configuration'))]
    });

    const configService = await container.getAsync(MidwayConfigService);
    const config = configService.getConfiguration();
    expect(config).toHaveProperty('hello',
      {
        'a': 1,
        'b': 4,
        'c': 3,
        'd': [
          1,
          2,
          3
        ]
      });

    expect(config).toHaveProperty('plugins',
      {
        'bucLogin': false
      });

    await destroyGlobalApplicationContext(container);
  });

  it('should test setup global config', async () => {
    const container = await initializeGlobalApplicationContext({
      baseDir,
      imports: [require(join(baseDir, 'configuration'))],
      globalConfig: {
        ccc: 222
      }
    });

    const configService = await container.getAsync(MidwayConfigService);
    const config = configService.getConfiguration();
    expect(config).toHaveProperty('hello',
      {
        'a': 1,
        'b': 4,
        'c': 3,
        'd': [
          1,
          2,
          3
        ]
      });

    expect(config).toHaveProperty('plugins',
      {
        'bucLogin': false
      });

    expect(config).toHaveProperty('ccc', 222);

    await destroyGlobalApplicationContext(container);
  });

  it('should test setup global config with env', async () => {
    const container = await initializeGlobalApplicationContext({
      baseDir,
      imports: [require(join(baseDir, 'configuration'))],
      globalConfig: [
        {
          default: {
            ccc: 333
          }
        }
      ]
    });

    const configService = await container.getAsync(MidwayConfigService);
    const config = configService.getConfiguration();
    expect(config).toHaveProperty('hello',
      {
        'a': 1,
        'b': 4,
        'c': 3,
        'd': [
          1,
          2,
          3
        ]
      });

    expect(config).toHaveProperty('plugins',
      {
        'bucLogin': false
      });

    expect(config).toHaveProperty('ccc', 333);

    await destroyGlobalApplicationContext(container);
  });

  it('should test setup a framework and get from container', async () => {
    /**
     * 一个全量的空框架
     */
    @Framework()
    class EmptyFramework extends BaseFramework<any, any, any> {
      async run(): Promise<void> {
      }

      async applicationInitialize(options: IMidwayBootstrapOptions) {
        this.app = {} as IMidwayApplication;
        this.defineApplicationProperties();
      }

      configure() {
        return {};
      }
    }

    @Configuration()
    class EmptyConfiguration {

      @Inject()
      customFramework: EmptyFramework;

      async onServerReady() {
        await this.customFramework.run();
      }
    }

    const container = await initializeGlobalApplicationContext({
      baseDir,
      imports: [require(join(baseDir, 'configuration')), {
        Configuration: EmptyConfiguration,
        EmptyFramework,
      }]
    });

    const configService = await container.getAsync(MidwayConfigService);
    const config = configService.getConfiguration();
    expect(config).toHaveProperty('hello',
      {
        'a': 1,
        'b': 4,
        'c': 3,
        'd': [
          1,
          2,
          3
        ]
      });

    expect(config).toHaveProperty('plugins',
      {
        'bucLogin': false
      });

    // test applicationContext set
    const framework = await container.getAsync(EmptyFramework);
    const app = framework.getApplication();
    expect(app.getApplicationContext()).toEqual(container);

    await destroyGlobalApplicationContext(container);
  });
});
