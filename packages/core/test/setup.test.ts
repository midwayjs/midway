import { join } from 'path';
import {
  BaseFramework, destroyGlobalApplicationContext, IMidwayApplication,
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
  MidwayConfigService,
  MidwayFrameworkType
} from '../src';
import { Configuration, Framework, Inject } from '@midwayjs/decorator';

describe('/test/setup.test.ts', () => {
  it('should test setup and config', async () => {
    const baseDir = join(
      __dirname,
      './fixtures/base-app-config/src'
    );
    const container = await initializeGlobalApplicationContext({
      baseDir,
      configurationModule: [require(join(baseDir, 'configuration'))]
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
    const baseDir = join(
      __dirname,
      './fixtures/base-app-config/src'
    );
    const container = await initializeGlobalApplicationContext({
      baseDir,
      configurationModule: [require(join(baseDir, 'configuration'))],
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
    const baseDir = join(
      __dirname,
      './fixtures/base-app-config/src'
    );
    const container = await initializeGlobalApplicationContext({
      baseDir,
      configurationModule: [require(join(baseDir, 'configuration'))],
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
      getFrameworkType(): MidwayFrameworkType {
        return MidwayFrameworkType.EMPTY;
      }

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

    const baseDir = join(
      __dirname,
      './fixtures/base-app-config/src'
    );
    const container = await initializeGlobalApplicationContext({
      baseDir,
      configurationModule: [require(join(baseDir, 'configuration')), {
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
