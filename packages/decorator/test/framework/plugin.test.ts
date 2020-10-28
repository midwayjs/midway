import {
  getClassMetadata,
  CLASS_KEY_CONSTRUCTOR,
  PLUGIN_KEY,
  Plugin,
} from '../../src';

class Test {
  constructor(@Plugin('aaa') aaa: any) {
    // ignore
  }

  @Plugin()
  test: any;

  @Plugin('bbb')
  bbb: any;
}

describe('/test/framework/plugin.test.ts', () => {
  it('plugin decorator should be ok', () => {
    let data = getClassMetadata(CLASS_KEY_CONSTRUCTOR, Test);
    expect(data).toStrictEqual({
      0: {
        key: 'aaa',
        type: PLUGIN_KEY,
      },
    });

    data = getClassMetadata(PLUGIN_KEY, Test);
    expect(data).toStrictEqual([
      { key: 'test', propertyName: 'test' },
      { key: 'bbb', propertyName: 'bbb' },
    ]);
  });
});
