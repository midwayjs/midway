import { safeContent } from '../src/utils';

describe('/test/util.test.ts', function () {
  it('should test safe format content', function () {
    expect(safeContent('')).toEqual('');
    expect(safeContent('ab')).toEqual('**');
    expect(safeContent('abcde')).toEqual('a****');
    expect(safeContent('abcdef')).toEqual('a****f');
    expect(safeContent('abcdefg')).toEqual('a*****g');
    expect(safeContent('abcdefghijklmn')).toEqual('ab**********mn');
    expect(safeContent('abcdefghijklmnopq')).toEqual('abc***********opq');
  });
});
