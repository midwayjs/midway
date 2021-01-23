import { getCurrentDateString } from '../src/utils';
import * as dayjs from 'dayjs';

describe('test/utils.test.ts', function () {

  it('should test getCurrentDateString', function () {
    //  2021-01-21 00:30:00
    const format = getCurrentDateString(1611160200000);
    expect(format).toEqual(dayjs(1611160200000).format('YYYY-MM-DD'));
  });
});
