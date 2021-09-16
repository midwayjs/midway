import {
  getClassMetadata,
  PLUGIN_KEY,
  Plugin,
} from '../../src';

class Test {
  @Plugin()
  test: any;

  @Plugin('bbb')
  bbb: any;
}

describe('/test/framework/plugin.test.ts', () => {
  it('plugin decorator should be ok', () => {
    let data = getClassMetadata(PLUGIN_KEY, Test);
    expect(data).toStrictEqual([
      { key: 'test', propertyName: 'test' },
      { key: 'bbb', propertyName: 'bbb' },
    ]);
  });
});
