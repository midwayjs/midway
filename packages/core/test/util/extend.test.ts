import { extend } from '../../src';

const str = 'me a test';
const integer = 10;
const arr = [1, 'what', new Date(81, 8, 4)];
const date = new Date(81, 4, 13);

const Foo = function () {};

const obj = {
  str: str,
  integer: integer,
  arr: arr,
  date: date,
  constructor: 'fake',
  isPrototypeOf: 'not a function',
  foo: new Foo()
};

const deep = {
  ori: obj,
  layer: {
    integer: 10,
    str: 'str',
    date: new Date(84, 5, 12),
    arr: [101, 'dude', new Date(82, 10, 4)],
    deep: {
      str: obj.str,
      integer: integer,
      arr: obj.arr,
      date: new Date(81, 7, 4)
    }
  }
};

describe('util/extend.test.ts', function () {
  it('missing arguments', function () {
    expect(extend(undefined, { a: 1 })).toStrictEqual({ a: 1 });
    expect(extend({ a: 1 })).toStrictEqual({ a: 1 });
    expect(extend(true, undefined, { a: 1 })).toStrictEqual({ a: 1 });
    expect(extend(true, { a: 1 })).toStrictEqual({ a: 1 });
    expect(extend()).toStrictEqual({});
  });

  it('merge string with string', function () {
    var ori = 'what u gonna say';
    var target = extend(ori, str);
    var expectedTarget = {
      0: 'm',
      1: 'e',
      2: ' ',
      3: 'a',
      4: ' ',
      5: 't',
      6: 'e',
      7: 's',
      8: 't'
    };

    expect(target).toEqual(expectedTarget);
  });

  it('merge string with number', function () {
    var ori = 'what u gonna say';
    var target = extend(ori, 10);

    expect(target).toEqual({});
  });

  it('merge string with array', function () {
    var ori = 'what u gonna say';
    var target = extend(ori, arr);

    expect(arr).toEqual([1, 'what', new Date(81, 8, 4)]);
    expect(target).toEqual({
      0: 1,
      1: 'what',
      2: new Date(81, 8, 4)
    });
  });

  it('merge string with date', function () {
    var ori = 'what u gonna say';
    var target = extend(ori, date);

    var testDate = new Date(81, 4, 13);
    expect(date).toEqual(testDate);
    expect(target).toEqual({});
  });

  it('merge string with obj', function () {
    var ori = 'what u gonna say';
    var target = extend(ori, obj);

    var testObj = {
      str: 'me a test',
      integer: 10,
      arr: [1, 'what', new Date(81, 8, 4)],
      date: new Date(81, 4, 13),
      constructor: 'fake',
      isPrototypeOf: 'not a function',
      foo: new Foo()
    };
    expect(obj).toEqual(testObj);
    expect(target).toEqual(testObj);
  });

  it('merge number with string', function () {
    var ori = 20;
    var target = extend(ori, str);

    expect(target).toEqual({
      0: 'm',
      1: 'e',
      2: ' ',
      3: 'a',
      4: ' ',
      5: 't',
      6: 'e',
      7: 's',
      8: 't'
    });
  });

  it('merge number with number', function () {
    expect(extend(20, 10)).toEqual({});
  });

  it('merge number with array', function () {
    var target = extend(20, arr);

    expect(arr).toEqual([1, 'what', new Date(81, 8, 4)]);
    expect(target).toEqual({
      0: 1,
      1: 'what',
      2: new Date(81, 8, 4)
    });
  });

  it('merge number with date', function () {
    var target = extend(20, date);
    var testDate = new Date(81, 4, 13);

    expect(date).toEqual(testDate);
    expect(target).toEqual({});
  });

  it('merge number with object', function () {
    var target = extend(20, obj);
    var testObj = {
      str: 'me a test',
      integer: 10,
      arr: [1, 'what', new Date(81, 8, 4)],
      date: new Date(81, 4, 13),
      constructor: 'fake',
      isPrototypeOf: 'not a function',
      foo: new Foo()
    };

    expect(obj).toEqual(testObj);
    expect(target).toEqual(testObj);
  });

  it('merge array with string', function () {
    var ori = [1, 2, 3, 4, 5, 6];
    var target = extend(ori, str);

    expect(ori).toEqual(str.split(''));
    expect(target).toEqual([
      "m",
      "e",
      " ",
      "a",
      " ",
      "t",
      "e",
      "s",
      "t"
    ]);
  });

  it('merge array with number', function () {
    var ori = [1, 2, 3, 4, 5, 6];
    var target = extend(ori, 10);

    expect(ori).toEqual([1, 2, 3, 4, 5, 6]);
    expect(target).toEqual(ori);
  });

  it('merge array with array', function () {
    var ori = [1, 2, 3, 4, 5, 6];
    var target = extend(ori, arr);
    var testDate = new Date(81, 8, 4);
    var expectedTarget = [1, 'what', testDate, 4, 5, 6];

    expect(ori).toEqual(expectedTarget);
    expect(arr).toEqual([1, 'what', testDate]);
    expect(target).toEqual(expectedTarget);
  });

  it('merge array with date', function () {
    var ori = [1, 2, 3, 4, 5, 6];
    var target = extend(ori, date);
    var testDate = new Date(81, 4, 13);
    var testArray = [1, 2, 3, 4, 5, 6];

    expect(ori).toEqual(testArray);
    expect(date).toEqual(testDate);
    expect(target).toEqual(testArray);
  });

  it('merge array with object', function () {
    var ori = [1, 2, 3, 4, 5, 6];
    var target = extend(ori, obj);
    var testObject = {
      str: 'me a test',
      integer: 10,
      arr: [1, 'what', new Date(81, 8, 4)],
      date: new Date(81, 4, 13),
      constructor: 'fake',
      isPrototypeOf: 'not a function',
      foo: new Foo()
    };

    expect(obj).toStrictEqual(testObject);
    expect(target.length).toEqual(6);
    expect(target.integer).toEqual(obj.integer);
    expect(target.arr).toEqual(obj.arr);
    expect(target.date).toEqual(obj.date);
  });

  it('merge date with string', function () {
    var ori = new Date(81, 9, 20);
    var target = extend(ori, str);

    expect(target).toEqual(ori);
  });

  it('merge date with number', function () {
    var ori = new Date(81, 9, 20);
    var target = extend(ori, 10);

    expect(target).toEqual(ori);
  });

  it('merge date with array', function () {
    var ori = new Date(81, 9, 20);
    var target = extend(ori, arr);
    var testDate = new Date(81, 9, 20);
    var testArray = [1, 'what', new Date(81, 8, 4)];

    expect(ori).toEqual(testDate);
    expect(arr).toEqual(testArray);
    expect(target).toEqual(testDate);
  });

  it('merge date with date', function () {
    var ori = new Date(81, 9, 20);
    var target = extend(ori, date);

    expect(target).toEqual(ori);
  });

  it('merge date with object', function () {
    var ori = new Date(81, 9, 20);
    var target = extend(ori, obj);

    expect(target).toEqual(ori);
  });

  it('merge object with string', function () {
    var testDate = new Date(81, 7, 26);
    var ori = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: testDate
    };
    var target = extend(ori, str);
    var testObj = {
      0: 'm',
      1: 'e',
      2: ' ',
      3: 'a',
      4: ' ',
      5: 't',
      6: 'e',
      7: 's',
      8: 't',
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: testDate
    };

    expect(ori).toEqual(testObj);
    expect(target).toEqual(testObj);
  });

  it('merge object with number', function () {
    var ori = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26)
    };
    var testObject = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26)
    };
    var target = extend(ori, 10);
    expect(ori).toEqual(testObject);
    expect(target).toEqual(testObject);
  });

  it('merge object with array', function () {
    var ori = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26)
    };
    var target = extend(ori, arr);
    var testObject = {
      0: 1,
      1: 'what',
      2: new Date(81, 8, 4),
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26)
    };

    expect(ori).toEqual(testObject);
    expect(arr).toEqual([1, 'what', testObject[2]]);
    expect(target).toEqual(testObject);

  });

  it('merge object with date', function () {
    var ori = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26)
    };
    var target = extend(ori, date);
    var testObject = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26)
    };

    expect(ori).toEqual(testObject);
    expect(date).toEqual(new Date(81, 4, 13));
    expect(target).toEqual(testObject);

  });

  it('merge object with object', function () {
    var ori = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26),
      foo: 'bar'
    };
    var target = extend(ori, obj);
    var expectedObj = {
      str: 'me a test',
      integer: 10,
      arr: [1, 'what', new Date(81, 8, 4)],
      date: new Date(81, 4, 13),
      constructor: 'fake',
      isPrototypeOf: 'not a function',
      foo: new Foo()
    };
    var expectedTarget = {
      str: 'me a test',
      integer: 10,
      arr: [1, 'what', new Date(81, 8, 4)],
      date: new Date(81, 4, 13),
      constructor: 'fake',
      isPrototypeOf: 'not a function',
      foo: new Foo()
    };

    expect(obj).toEqual(expectedObj);
    expect(ori).toEqual(expectedTarget);
    expect(target).toEqual(expectedTarget);

  });

  it('deep clone', function () {
    var ori = {
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26),
      layer: { deep: { integer: 42 } }
    };
    var target = extend(true, ori, deep);

    expect(ori).toEqual({
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26),
      ori: {
        str: 'me a test',
        integer: 10,
        arr: [1, 'what', new Date(81, 8, 4)],
        date: new Date(81, 4, 13),
        constructor: 'fake',
        isPrototypeOf: 'not a function',
        foo: new Foo()
      },
      layer: {
        integer: 10,
        str: 'str',
        date: new Date(84, 5, 12),
        arr: [101, 'dude', new Date(82, 10, 4)],
        deep: {
          str: 'me a test',
          integer: 10,
          arr: [1, 'what', new Date(81, 8, 4)],
          date: new Date(81, 7, 4)
        }
      }
    });
    expect(deep).toEqual({
      ori: {
        str: 'me a test',
        integer: 10,
        arr: [1, 'what', new Date(81, 8, 4)],
        date: new Date(81, 4, 13),
        constructor: 'fake',
        isPrototypeOf: 'not a function',
        foo: new Foo()
      },
      layer: {
        integer: 10,
        str: 'str',
        date: new Date(84, 5, 12),
        arr: [101, 'dude', new Date(82, 10, 4)],
        deep: {
          str: 'me a test',
          integer: 10,
          arr: [1, 'what', new Date(81, 8, 4)],
          date: new Date(81, 7, 4)
        }
      }
    });
    expect(target).toEqual({
      str: 'no shit',
      integer: 76,
      arr: [1, 2, 3, 4],
      date: new Date(81, 7, 26),
      ori: {
        str: 'me a test',
        integer: 10,
        arr: [1, 'what', new Date(81, 8, 4)],
        date: new Date(81, 4, 13),
        constructor: 'fake',
        isPrototypeOf: 'not a function',
        foo: new Foo()
      },
      layer: {
        integer: 10,
        str: 'str',
        date: new Date(84, 5, 12),
        arr: [101, 'dude', new Date(82, 10, 4)],
        deep: {
          str: 'me a test',
          integer: 10,
          arr: [1, 'what', new Date(81, 8, 4)],
          date: new Date(81, 7, 4)
        }
      }
    });

    target.layer.deep = 339;
    expect(deep).toEqual({
      ori: {
        str: 'me a test',
        integer: 10,
        arr: [1, 'what', new Date(81, 8, 4)],
        date: new Date(81, 4, 13),
        constructor: 'fake',
        isPrototypeOf: 'not a function',
        foo: new Foo()
      },
      layer: {
        integer: 10,
        str: 'str',
        date: new Date(84, 5, 12),
        arr: [101, 'dude', new Date(82, 10, 4)],
        deep: {
          str: 'me a test',
          integer: 10,
          arr: [1, 'what', new Date(81, 8, 4)],
          date: new Date(81, 7, 4)
        }
      }
    });
    // ----- NEVER USE EXTEND WITH THE ABOVE SITUATION ------------------------------

  });

  it('deep clone; arrays are override', function () {
    var defaults = { arr: [1, 2, 3] };
    var override = { arr: ['x'] };
    var expectedTarget = { arr: ['x'] };

    var target = extend(true, defaults, override);

    expect(target).toEqual(expectedTarget);

  });

  it('deep clone === false; objects merged normally', function () {
    var defaults = { a: 1 };
    var override = { a: 2 };
    var target = extend(false, defaults, override);
    expect(target).toEqual(override);

  });

  it('pass in null; should create a valid object', function () {
    var override = { a: 1 };
    var target = extend(null, override);
    expect(target).toEqual(override);

  });

  it.skip('works without Array.isArray', function () {
    var savedIsArray = Array.isArray;
    (Array as any).isArray = false; // don't delete, to preserve enumerability
    var target = [];
    var source = [1, [2], { 3: true }];
    expect(
      extend(true, target, source)).toEqual(
      [1, [2], { 3: true }],
    );
    Array.isArray = savedIsArray;
  });

  it('fix __proto__ copy', function () {
    const r = extend(true, {}, JSON.parse('{"__proto__": {"polluted": "yes"}}'));
    expect(
      JSON.stringify(r)).toEqual(
      '{}'
    );
    expect(
      ('' as any).polluted).toEqual(
      undefined,
    );
  });

  it('should test null merge', function () {
    const r = extend(true, {
      a: 1
    }, {a: null});
    expect(r.a).toBe(null);
  });

});
