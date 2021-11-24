import { MidwayError } from '../src';

describe('/test/error.test.ts', function () {
  it('should test base error', function () {
    expect(() => {
      throw new MidwayError('custom error');
    }).toThrowError(MidwayError);
  });

  it('should test error cause', function () {
    const err = new MidwayError('custom error');
    expect(err.code).toEqual(10000);

    const err2 = new MidwayError('custom error22', 100, {
      cause: err
    });

    expect(err2.code).toEqual(100);
    expect(err2.cause).toEqual(err);

    expect(() => {
      throw err2;
    }).toThrowError(/custom error22/);
  });
});
