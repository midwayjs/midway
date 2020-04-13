import { uppercaseObjectKey } from '../src/utils';
import { deepStrictEqual } from 'assert';

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
});
