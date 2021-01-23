import { getCurrentDateString } from '../src/utils';

describe('test/utils.test.ts', function () {

  it('should test getCurrentDateString', function () {
    //  2021-01-21 00:30:00
    const format = getCurrentDateString(1611160200000);
    const d = new Date(1611160200000);
    expect(format).toEqual(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}`);
  });
});
