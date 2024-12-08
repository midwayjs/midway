import { ComponentConfigurationLoader } from '../../src/context/componentLoader';
import {
  MidwayContainer,
  Configuration,
  MidwayConfigService,
  MidwayInformationService,
  MidwayEnvironmentService,
  Provide,
  CustomModuleDetector
} from '../../src';
import { defineConfiguration } from '../../src/functional';

describe('ComponentConfigurationLoader.test.ts', () => {

  it('should load configuration with namespace', async () => {
    @Configuration({
      namespace: 'test'
    })
    class TestConfiguration {}

    const container = new MidwayContainer();
    const loader = new ComponentConfigurationLoader(container);

    await loader.load(TestConfiguration)
    expect(loader.getNamespaceList()).toContain('test');
  });

  it('should load functional configuration', async () => {
    const config = defineConfiguration({
      namespace: 'test'
    });
    const container = new MidwayContainer();
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(config)
    expect(loader.getNamespaceList()).toContain('test');
  });

  it('should load configuration multi-level', async () => {
    @Configuration({
      namespace: 'test'
    })
    class TestConfiguration {}

    @Configuration({
      namespace: 'test2',
      imports: [{ Configuration: TestConfiguration }]
    })
    class TestConfiguration2 {}

    const container = new MidwayContainer();
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(TestConfiguration2);
    expect(loader.getNamespaceList()).toContain('test');
    expect(loader.getNamespaceList()).toContain('test2');
  });

  it('should load configuration with importConfigs', async () => {
    @Configuration({
      namespace: 'test',
      importConfigs: [{ default: { a: 1 } }]
    })
    class TestConfiguration {}

    const container = new MidwayContainer();
    container.bind(MidwayConfigService);
    container.bind(MidwayInformationService);
    container.bind(MidwayEnvironmentService);
    container.registerObject('appDir', './');
    container.registerObject('baseDir', './');

    const configService = await container.getAsync(MidwayConfigService);
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(TestConfiguration);

    configService.load();

    expect(configService.getConfiguration('a')).toEqual(1);
  });

  it('should load configuration with importConfigFilter', async () => {
    @Configuration({
      namespace: 'test',
      importConfigFilter: (config) => {
        config.a = 2;
        return config;
      },
      importConfigs: [{ default: { a: 1 } }]
    })
    class TestConfiguration {}

    const container = new MidwayContainer();
    container.bind(MidwayConfigService);
    container.bind(MidwayInformationService);
    container.bind(MidwayEnvironmentService);
    container.registerObject('appDir', './');
    container.registerObject('baseDir', './');

    const configService = await container.getAsync(MidwayConfigService);
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(TestConfiguration);

    configService.load();

    expect(configService.getConfiguration('a')).toEqual(2);
  });

  it('should load configuration with importObjects', async () => {
    @Configuration({
      namespace: 'test',
      importObjects: { a: 1 }
    })
    class TestConfiguration {}

    const container = new MidwayContainer();
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(TestConfiguration);

    expect(container.get('a')).toEqual(1);
  });

  it('should load configuration with imports', async () => {
    @Configuration({
      namespace: 'test',
      imports: [{ Configuration: TestConfiguration }]
    })
    class TestConfiguration {}

    const container = new MidwayContainer();
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(TestConfiguration);

    expect(loader.getNamespaceList()).toContain('test');
  });

  it('should load configuration with detector', async () => {
    @Provide()
    class Test {
      a = 1;
    }

    @Configuration({
      namespace: 'test',
      detector: new CustomModuleDetector({
        modules: [Test]
      }),
    })
    class TestConfiguration {}

    const container = new MidwayContainer();
    const loader = new ComponentConfigurationLoader(container);
    await loader.load(TestConfiguration);

    expect(container.get(Test).a).toEqual(1);
  });
});
