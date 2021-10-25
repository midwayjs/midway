import {
  getClassMetadata,
  Plugin,
  INJECT_CUSTOM_PROPERTY
} from '../../src';

class Test {
  @Plugin()
  test: any;

  @Plugin('bbb')
  bbb: any;
}

describe('/test/framework/plugin.test.ts', () => {
  it('plugin decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_PROPERTY, Test);
    expect(data).toMatchSnapshot();
  });
});
