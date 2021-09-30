import { ObjectProperties } from '../../src/definitions/properties';
import {expect} from 'chai';

describe('/test/definitions/properties.test.ts', () => {

  it('#ObjectProperties test object config ok', () => {
    const config = new ObjectProperties();
    config.set('aa', 1);
    config.set('bb', 2);
    config.set('cc', 'hello world');
    config.set('ee', {dd: 'test dd', aa: 'hello'});

    expect(config.has('aa')).true;
    expect(config.has('dd')).false;
    expect(config.get('cc')).eq('hello world');

    const ee = config.get('ee');
    config.get('ee').dd = '123';
    expect(ee.dd).eq('123');

    const config1 = new ObjectProperties();
    config1.set('aa', 22);
    config1.set('bb', '1243');
    config1.set('ee', {dd: '222', ff: 123});

    expect(config.get('aa')).eq(22);
    expect(config.get('bb')).eq('1243');
    expect(config.set('bb', '111')).eq('1243');
    expect(config.get('ee')).deep.eq({dd: '222', ff: 123, aa: 'hello'});

    expect(config.size).greaterThan(1);
    config.clear();
    expect(config.size).eq(0);
  });
});
