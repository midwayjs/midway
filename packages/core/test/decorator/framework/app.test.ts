import {
  App,
  ApplicationContext,
  CUSTOM_PROPERTY_INJECT_KEY,
  MetadataManager
} from '../../../src';

class Test {
  @App()
  hhh: any;

  @ApplicationContext()
  container: any;
}

describe('/test/framework/app.test.ts', () => {
  it('app decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(CUSTOM_PROPERTY_INJECT_KEY, Test)).toMatchSnapshot();
  });
});
