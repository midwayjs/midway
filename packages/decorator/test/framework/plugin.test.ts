import { expect } from 'chai';
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
    expect(data).deep.eq({
      0: {
        key: 'aaa',
        type: PLUGIN_KEY,
      },
    });

    data = getClassMetadata(PLUGIN_KEY, Test);
    expect(data).deep.eq([
      { key: 'test', propertyName: 'test' },
      { key: 'bbb', propertyName: 'bbb' },
    ]);
  });
});
