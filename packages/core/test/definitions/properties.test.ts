import { ObjectProperties } from '../../src/definitions/properties';

describe('/test/definitions/properties.test.ts', () => {

  it('#ObjectProperties test object config ok', () => {
    const config = new ObjectProperties();
    config.set('aa', 1);
    config.set('bb', 2);
    config.set('cc', 'hello world');
    config.set('ee', { dd: 'test dd', aa: 'hello' });

    expect(config.has('aa')).toBeTruthy();
    expect(config.has('dd')).toBeFalsy();
    expect(config.get('cc')).toEqual('hello world');

    expect(config.get('cc')).toEqual(config.getProperty('cc'));
    config.setProperty('ff', 'abc');
    expect(config.getProperty('ff')).toEqual('abc');
    expect(config.propertyKeys()).toEqual([
      'aa',
      'bb',
      'cc',
      'ee',
      'ff'
    ]);

    config.clear();
    expect(config.size).toEqual(0);
  });
});
