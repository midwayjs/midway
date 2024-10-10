import {
  Pipeline,
  Provide,
  INJECT_CUSTOM_PROPERTY,
  MetadataManager
} from '../../../src';

@Provide()
class Test {
  @Pipeline()
  dd: any;
}

describe('/test/annotation/pipeline.test.ts', () => {
  it('pipeline decorator should be ok', () => {
    expect(MetadataManager.getPropertiesWithMetadata(INJECT_CUSTOM_PROPERTY, Test)).toMatchSnapshot();
  });
});
