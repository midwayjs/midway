import {
  Config,
  getClassMetadata,
  INJECT_CUSTOM_PROPERTY,
} from '../../src';

class Test {
  @Config()
  hhh: any;

  @Config('bbb')
  bbb: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_PROPERTY, Test);
    expect(data).toMatchSnapshot();
  });
});
