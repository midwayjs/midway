import {
  getClassMetadata,
  Plugin,
  INJECT_CUSTOM_TAG
} from '../../src';

class Test {
  @Plugin()
  test: any;

  @Plugin('bbb')
  bbb: any;
}

describe('/test/framework/plugin.test.ts', () => {
  it('plugin decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_TAG, Test);
    expect(data).toMatchSnapshot();
  });
});
