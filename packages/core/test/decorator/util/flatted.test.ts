import { Utils } from '../../../src/';
const { safeStringify, safeParse } = Utils;

describe('/test/util/flatted.test.ts', function () {
  it('should test base stringify', function () {
    expect(safeStringify([null, null])).toEqual('[[null,null]]');

    var a = [];
    var o = {} as any;

    expect(safeStringify(a)).toEqual('[[]]');
    expect(safeStringify(o)).toEqual('[{}]');

    a.push(a);
    o.o = o;

    expect(safeStringify(a)).toEqual('[["0"]]');
    expect(safeStringify(o)).toEqual('[{"o":"0"}]');

    var b = safeParse(safeStringify(a));
    expect(Array.isArray(b) && b[0]).toEqual(b);

    a.push(1, 'two', true);
    o.one = 1;
    o.two = 'two';
    o.three = true;

    expect(safeStringify(a)).toEqual('[["0",1,"1",true],"two"]');
    expect(safeStringify(o)).toEqual('[{"o":"0","one":1,"two":"1","three":true},"two"]');


    a.push(o);
    o.a = a;

    expect(safeStringify(a)).toEqual('[["0",1,"1",true,"2"],"two",{"o":"2","one":1,"two":"1","three":true,"a":"0"}]');
    expect(safeStringify(o)).toEqual('[{"o":"0","one":1,"two":"1","three":true,"a":"2"},"two",["2",1,"1",true,"0"]]');

    a.push({test: 'OK'}, [1, 2, 3]);
    o.test = {test: 'OK'};
    o.array = [1, 2, 3];

    expect(safeStringify(a)).toEqual('[["0",1,"1",true,"2","3","4"],"two",{"o":"2","one":1,"two":"1","three":true,"a":"0","test":"5","array":"6"},{"test":"7"},[1,2,3],{"test":"7"},[1,2,3],"OK"]');
    expect(safeStringify(o)).toEqual('[{"o":"0","one":1,"two":"1","three":true,"a":"2","test":"3","array":"4"},"two",["2",1,"1",true,"0","5","6"],{"test":"7"},[1,2,3],{"test":"7"},[1,2,3],"OK"]');

    a = safeParse(safeStringify(a));
    o = safeParse(safeStringify(o));

    expect(a[0]).toEqual(a);
    expect(o.o).toEqual(o);

    expect(
      a[1] === 1 &&
      a[2] === 'two' &&
      a[3] === true &&
      a[4] instanceof Object &&
      JSON.stringify(a[5]) === JSON.stringify({test: 'OK'}) &&
      JSON.stringify(a[6]) === JSON.stringify([1, 2, 3]),
    ).toBeTruthy();

    expect(a[4] === a[4].o && a === a[4].o.a).toBeTruthy();

    expect(
      o.one === 1 &&
      o.two === 'two' &&
      o.three === true &&
      Array.isArray(o.a) &&
      JSON.stringify(o.test) === JSON.stringify({test: 'OK'}) &&
      JSON.stringify(o.array) === JSON.stringify([1, 2, 3]),
    ).toBeTruthy();

    expect(o.a === o.a[0] && o === o.a[4]).toBeTruthy();

    expect(safeParse(safeStringify(1)) === 1).toBeTruthy();
    expect(safeParse(safeStringify(false)) === false).toBeTruthy();
    expect(safeParse(safeStringify(null)) === null).toBeTruthy();
    expect(safeParse(safeStringify('test'))).toEqual('test');

    var d = new Date;
    expect(safeParse(safeStringify(d)) === d.toISOString()).toBeTruthy();

    expect(safeParse(
      safeStringify(d),
      function (key, value) {
        if (typeof value === 'string' && /^[0-9:.ZT-]+$/.test(value))
          return new Date(value);
        return value;
      }
    ) instanceof Date).toBeTruthy();

    expect(safeParse(
      safeStringify({
        sub: {
          one23: 123,
          date: d
        }
      }),
      function (key, value) {
        if (key !== '' && typeof value === 'string' && /^[0-9:.ZT-]+$/.test(value))
          return new Date(value);
        return value;
      }
    ).sub.date instanceof Date).toBeTruthy();
  });
});
