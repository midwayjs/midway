import { createConfiguration } from '../../src';

describe('test/functional/configuration.test.ts', function () {
  it('should test create functional configuration', function () {
    const options = {
      imports: [],
      importConfigs: {},
      importObjects: {},
    };

    const configuration = createConfiguration(options);

    // set
    configuration.onConfigLoad(() => {});
    configuration.onReady(() => {});
    configuration.onServerReady(() => {});
    configuration.onStop(() => {});

    // run
    const app = {a: 1} as any;
    const container = {} as any;
    configuration.onConfigLoad(container, app);
    configuration.onReady(container, app);
    configuration.onServerReady(container, app);
    configuration.onStop(container, app);

    expect(configuration.getConfigurationOptions()).toEqual(options);
  });
});
