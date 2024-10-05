import {
  Config,
  INJECT_CUSTOM_PROPERTY,
  MetadataManager
} from '../../../src';

class Test {
  @Config()
  hhh: any;

  @Config('bbb')
  bbb: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(INJECT_CUSTOM_PROPERTY, Test)).toMatchSnapshot();
  });
});
