import {
  Logger,
  getClassMetadata,
  INJECT_CUSTOM_PROPERTY,
} from '../../src';

class Test {
  @Logger()
  logger: any;

  @Logger('bbb')
  bbb: any;
}

describe('/test/framework/logger.test.ts', () => {
  it('logger decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_PROPERTY, Test);
    expect(data).toMatchSnapshot();
  });
});
