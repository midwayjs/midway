import {
  Config,
  getClassMetadata,
  CONFIG_KEY,
} from '../../src';

class Test {
  @Config()
  hhh: any;

  @Config('bbb')
  bbb: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    let data = getClassMetadata(CONFIG_KEY, Test);
    expect(data).toStrictEqual([
      { key: 'hhh', propertyName: 'hhh' },
      { key: 'bbb', propertyName: 'bbb' },
    ]);
  });
});
