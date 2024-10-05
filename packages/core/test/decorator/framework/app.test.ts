import {
  App,
  INJECT_CUSTOM_PROPERTY,
  ApplicationContext,
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
    expect(MetadataManager.getPropertiesWithMetadata(INJECT_CUSTOM_PROPERTY, Test)).toMatchSnapshot();
  });
});
