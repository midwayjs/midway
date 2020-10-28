import {
  Config,
  getClassMetadata,
  CONFIG_KEY,
  CLASS_KEY_CONSTRUCTOR,
} from '../../src';

class Test {
  constructor(@Config('aaa') aaa: any) {
    // ignore
  }

  @Config()
  hhh: any;

  @Config('bbb')
  bbb: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    let data = getClassMetadata(CLASS_KEY_CONSTRUCTOR, Test);
    expect(data).toStrictEqual({
      0: {
        key: 'aaa',
        type: CONFIG_KEY,
      },
    });

    data = getClassMetadata(CONFIG_KEY, Test);
    expect(data).toStrictEqual([
      { key: 'hhh', propertyName: 'hhh' },
      { key: 'bbb', propertyName: 'bbb' },
    ]);
  });
});
