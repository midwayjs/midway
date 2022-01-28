import { crc32 } from '../src/lib/crc';

describe('/test/crc.test.ts', function () {

  it('should crc32 get value', function () {
    expect(crc32('1234567890')).toEqual(639479525);
    expect(crc32(JSON.stringify({
      data: {
        bbb: 'ccc'
      }
    }))).toEqual(421051290);
    // expect(crc32('a', true)).toEqual('e8b7be43');
    expect(crc32('abc', true)).toEqual('352441c2');
    expect(crc32('message digest', true)).toEqual('20159d7f');
    expect(crc32('abcdefghijklmnopqrstuvwxyz', true)).toEqual('4c2750bd');
    expect(crc32('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', true)).toEqual('1fc2e6d2');
    expect(crc32('12345678901234567890123456789012345678901234567890123456789012345678901234567890', true)).toEqual('7ca94a72');
  });

  // it('should crc32 equal origin value', function () {
  //   expect(crcOrigin('1234567890')).toEqual(crc32('1234567890'));
  //   expect(crcOrigin(JSON.stringify({
  //     data: {
  //       bbb: 'ccc'
  //     }
  //   }))).toEqual(crc32(JSON.stringify({
  //     data: {
  //       bbb: 'ccc'
  //     }
  //   })));
  //   // expect(crcOrigin('a')).toEqual(crc32('a'));
  //   expect(crcOrigin('abc')).toEqual(crc32('abc'));
  //   expect(crcOrigin('message digest')).toEqual(crc32('message digest'));
  //   expect(crcOrigin('abcdefghijklmnopqrstuvwxyz')).toEqual(crc32('abcdefghijklmnopqrstuvwxyz'));
  //   expect(crcOrigin('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')).toEqual(crc32('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'));
  //   expect(crcOrigin('12345678901234567890123456789012345678901234567890123456789012345678901234567890')).toEqual(crc32('12345678901234567890123456789012345678901234567890123456789012345678901234567890'));
  // });
});
