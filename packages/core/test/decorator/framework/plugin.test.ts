import {
  Plugin,
  MetadataManager,
  CUSTOM_PROPERTY_INJECT_KEY
} from '../../../src';

class Test {
  @Plugin()
  test: any;

  @Plugin('bbb')
  bbb: any;
}

describe('/test/framework/plugin.test.ts', () => {
  it('plugin decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(CUSTOM_PROPERTY_INJECT_KEY, Test)).toMatchSnapshot();
  });
});
