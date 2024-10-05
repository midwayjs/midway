import {
  Plugin,
  INJECT_CUSTOM_PROPERTY,
  MetadataManager
} from '../../../src';

class Test {
  @Plugin()
  test: any;

  @Plugin('bbb')
  bbb: any;
}

describe('/test/framework/plugin.test.ts', () => {
  it('plugin decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(INJECT_CUSTOM_PROPERTY, Test)).toMatchSnapshot();
  });
});
