import {
  Config,
  getClassMetadata,
  INJECT_CUSTOM_TAG,
} from '../../src';

class Test {
  @Config()
  hhh: any;

  @Config('bbb')
  bbb: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_TAG, Test);
    expect(data).toMatchSnapshot();
  });
});
