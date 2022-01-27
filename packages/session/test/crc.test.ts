import { crc32 } from '../src/lib/crc';

describe('/test/crc.test.ts', function () {

  it('should crc32 get value', function () {
    expect(crc32('1234567890')).toEqual(639479525);
    expect(crc32(JSON.stringify({
      data: {
        bbb: 'ccc'
      }
    }))).toEqual(421051290);
  });
});
