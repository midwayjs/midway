import { MidwayError, MidwayHttpError, registerErrorCode } from '../../src';

describe('/test/error/error.test.ts', function () {
  it('should test base error', function () {
    expect(() => {
      throw new MidwayError('custom error');
    }).toThrowError(MidwayError);
  });

  it('should test error cause', function () {
    const err = new MidwayError('custom error');
    expect(err.code).toEqual('MIDWAY_10000');

    const err2 = new MidwayError('custom error22', '100', {
      cause: err
    });

    expect(err2.code).toEqual('100');
    expect(err2.cause).toEqual(err);

    expect(() => {
      throw err2;
    }).toThrowError(/custom error22/);
  });

  it('should test register error code', function () {
    const CUSTOM_ERROR_CODE = registerErrorCode('custom', {
      A: 1000,
      B: 1001,
      C: 1002,
    } as const);

    expect(CUSTOM_ERROR_CODE.A).toEqual('CUSTOM_1000');
    expect(CUSTOM_ERROR_CODE.B).toEqual('CUSTOM_1001');
    expect(CUSTOM_ERROR_CODE.C).toEqual('CUSTOM_1002');
  });

  it('should test error group duplicate', function () {
    registerErrorCode('custom_error', {
      A: 1000,
    } as const);

    expect(() => {
      registerErrorCode('custom_error', {
        A: 1000,
      } as const);
    }).toThrowError(MidwayError);
  });

  it('should test http error', function () {
    expect(() => {
      throw new MidwayHttpError('custom error', 302);
    }).toThrowError(MidwayHttpError);
  });

  it('should test http error with err obj', function () {
    const err = new Error('custom message');
    expect(() => {
      throw new MidwayHttpError(err, 302);
    }).toThrowError(/custom message/);
  });

  it('should test with options', function () {
    const cause = new Error('custom');
    const err = new MidwayError('custom error', {
      status: 10,
      cause,
    });

    expect(() => {
      throw err;
    }).toThrowError(/custom error/);
  });
});
