import { Utils } from '../../../src';
import * as assert from 'assert';

describe('test/util/uuid.test.ts', () => {

  it('subsequent UUIDs are different', () => {
    const id1 = Utils.randomUUID();
    const id2 = Utils.randomUUID();
    assert(id1 !== id2);

    const id3 = Utils.randomUUID(true);
    const id4 = Utils.randomUUID(true);
    assert(id3 !== id4);
  });
});
