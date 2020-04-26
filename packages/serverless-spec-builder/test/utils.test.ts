import {
  uppercaseObjectKey,
  removeObjectEmptyAttributes,
  filterUserDefinedEnv,
} from '../src/utils';
import { deepStrictEqual } from 'assert';
import * as mm from 'mm';

describe('/test/utils.test.ts', () => {
  it('test unppercase', () => {
    const json = {
      a: 1,
      bbbb: 2,
      ddd: [
        'ccc',
        {
          fff: ['eee'],
        },
      ],
    };
    const result = uppercaseObjectKey(json);
    deepStrictEqual(result, {
      A: 1,
      Bbbb: 2,
      Ddd: ['ccc', { Fff: ['eee'] }],
    });
  });

  it('empty object', () => {
    const result = removeObjectEmptyAttributes({
      a: null,
      b: 1,
      c: [
        {
          d: [{}],
          ff: [undefined, null],
        },
      ],
      e: [1, undefined],
      f: '',
    });
    deepStrictEqual(result, { b: 1, e: [1] });
  });

  it('filterUserDefinedEnv', () => {
    mm(process.env, 'UDEV_NODE_ENV', 'prod');
    const env = filterUserDefinedEnv();
    deepStrictEqual(env['NODE_ENV'], 'prod');
    mm.restore();
  });
});
