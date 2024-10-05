import {
  Logger,
  INJECT_CUSTOM_PROPERTY,
  MetadataManager
} from '../../../src';

class Test {
  @Logger()
  logger: any;

  @Logger('bbb')
  bbb: any;
}

describe('/test/framework/logger.test.ts', () => {
  it('logger decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(INJECT_CUSTOM_PROPERTY, Test)).toMatchSnapshot();
  });
});
