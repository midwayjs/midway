import { ObjectProperties } from '../../src/definitions/properties';
import {expect} from 'chai';

describe('/test/definitions/properties.test.ts', () => {

  describe('#ObjectProperties', () => {
    it('test object config ok', () => {
      const config = new ObjectProperties();
      expect(config.dup('this is a empty dup')).null;

      config.set('aa', 1);
      config.set('bb', 2);
      config.set('cc', 'hello world');
      config.set('ee', {dd: 'test dd', aa: 'hello'});

      expect(config.has('aa')).true;
      expect(config.has('dd')).false;
      expect(config.get('cc')).eq('hello world');
      const dupee = config.dup('ee');
      expect(dupee).deep.eq({dd: 'test dd', aa: 'hello'});

      const ee = config.get('ee');
      config.get('ee').dd = '123';
      expect(ee.dd).eq('123');
      expect(dupee).not.deep.eq(ee);

      const config1 = new ObjectProperties();
      config1.set('aa', 22);
      config1.set('bb', '1243');
      config1.set('ee', {dd: '222', ff: 123});

      config.putAll(config1);

      expect(config.get('aa')).eq(22);
      expect(config.get('bb')).eq('1243');
      expect(config.set('bb', '111')).eq('1243');
      expect(config.get('ee')).deep.eq({dd: '222', ff: 123, aa: 'hello'});

      expect(config.size).greaterThan(1);
      config.clear();
      expect(config.size).eq(0);

      config1.set('ccc', 'this is %s-%s test');
      expect(config1.get('ccc', 'mf', 'hhh')).eq('this is mf-hhh test');
    });
  });
});
