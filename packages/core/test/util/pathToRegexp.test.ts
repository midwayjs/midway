import { PathToRegexpUtil } from '../../src';

describe('/test/util/pathToRegexp.test.ts', () => {

  it('should test to regexp', function () {
    const keys = [];
    const regexp = PathToRegexpUtil.toRegexp('/foo/:bar', keys);
    expect(regexp).toEqual(/^\/foo(?:\/([^\/#\?]+?))[\/#\?]?$/i);
    expect(keys).toEqual([{name: 'bar', prefix: '/', suffix: '', pattern: '[^\\/#\\?]+?', modifier: ''}]);
  });

  it('should test named Parameters', function () {
    const regexp = PathToRegexpUtil.toRegexp('/:foo/:bar');
    expect(JSON.stringify(regexp.exec('/test/route'))).toEqual(JSON.stringify(['/test/route', 'test', 'route']));
  });

  it('should test custom Matching Parameters', function () {
    const regexpNumbers = PathToRegexpUtil.toRegexp("/icon-:foo(\\d+).png");
// keys = [{ name: 'foo', ... }]

    expect(JSON.stringify(regexpNumbers.exec("/icon-123.png"))).toEqual(JSON.stringify(['/icon-123.png', '123']));

    expect(regexpNumbers.exec("/icon-abc.png")).toEqual(null);

    const regexpWord = PathToRegexpUtil.toRegexp("/(user|u)");
// keys = [{ name: 0, ... }]

    expect(JSON.stringify(regexpWord.exec("/u"))).toEqual(JSON.stringify(['/u', 'u']));

    expect(regexpWord.exec("/users")).toEqual(null);
  });

  it('should test match', function () {
    const fn = PathToRegexpUtil.match('/user/:id', {decode: decodeURIComponent});
    expect(fn('/user/123')).toMatchSnapshot(); //=> { path: '/user/123', index: 0, params: { id: '123' } }
    expect(fn('/invalid')).toMatchSnapshot(); //=> false
    expect(fn('/user/caf%C3%A9')).toMatchSnapshot(); //
  });

});
