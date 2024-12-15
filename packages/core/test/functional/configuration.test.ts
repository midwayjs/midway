import { defineConfiguration } from '../../src/functional';
import {
  CustomModuleDetector,
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  Provide
} from '../../src';
import { ComponentConfigurationLoader } from '../../src/context/componentLoader';

describe('test/functional/configuration.test.ts', function () {
  it('should test create functional configuration', async () => {
    @Provide()
    class Test {
      async hello() {
        return 'hello';
      }
    }

    const configuration = defineConfiguration({
      imports: [],
      importConfigs: {},
      importObjects: {},
      detector: new CustomModuleDetector({
        modules: [
          Test,
        ]
      }),
      onConfigLoad: async () => {},
      onReady: async () => {},
      onServerReady: async () => {},
      onStop: async () => {},
      namespace: 'hello',
    });

    const container = new MidwayContainer();
    container.bind(MidwayConfigService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.registerObject('appDir', __dirname);
    container.registerObject('baseDir', __dirname);

    const loader = new ComponentConfigurationLoader(container);
    await loader.load(configuration);

    expect(loader.getNamespaceList()).toEqual(['hello']);
    const test = await container.getAsync<Test>(Test);
    expect(await test.hello()).toEqual('hello');
  });
});
