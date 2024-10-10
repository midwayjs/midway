import {
  Logger,
  MetadataManager,
  CUSTOM_PROPERTY_INJECT_KEY
} from '../../../src';

class Test {
  @Logger()
  logger: any;

  @Logger('bbb')
  bbb: any;
}

describe('/test/framework/logger.test.ts', () => {
  it('logger decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(CUSTOM_PROPERTY_INJECT_KEY, Test)).toMatchSnapshot();
  });
});
