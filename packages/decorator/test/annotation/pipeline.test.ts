import {
  Pipeline,
  Provide,
  INJECT_CUSTOM_PROPERTY,
  getClassMetadata,
} from '../../src';

@Provide()
class Test {
  @Pipeline()
  dd: any;
}

describe('/test/annotation/pipeline.test.ts', () => {
  it('pipeline decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_PROPERTY, Test);
    expect(data).toMatchSnapshot();
  });
});
