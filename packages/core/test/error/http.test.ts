import { httpError } from '../../src';

describe('test/error/http.test.ts', function () {
  it('should test throw http error', function () {
    expect(() => {
      throw new httpError.BadRequestError();
    }).toThrowError(httpError.BadRequestError);

    expect(() => {
      throw new httpError.UnauthorizedError();
    }).toThrowError(httpError.UnauthorizedError);

    expect(() => {
      throw new httpError.NotFoundError();
    }).toThrowError(httpError.NotFoundError);

    expect(() => {
      throw new httpError.ForbiddenError();
    }).toThrowError(httpError.ForbiddenError);

    expect(() => {
      throw new httpError.NotAcceptableError();
    }).toThrowError(httpError.NotAcceptableError);

    expect(() => {
      throw new httpError.RequestTimeoutError();
    }).toThrowError(httpError.RequestTimeoutError);

    expect(() => {
      throw new httpError.ConflictError();
    }).toThrowError(httpError.ConflictError);

    expect(() => {
      throw new httpError.GoneError();
    }).toThrowError(httpError.GoneError);

    expect(() => {
      throw new httpError.PayloadTooLargeError();
    }).toThrowError(httpError.PayloadTooLargeError);

    expect(() => {
      throw new httpError.UnsupportedMediaTypeError();
    }).toThrowError(httpError.UnsupportedMediaTypeError);

    expect(() => {
      throw new httpError.UnprocessableEntityError();
    }).toThrowError(httpError.UnprocessableEntityError);

    expect(() => {
      throw new httpError.TooManyRequestsError();
    }).toThrowError(httpError.TooManyRequestsError);

    expect(() => {
      throw new httpError.InternalServerErrorError();
    }).toThrowError(httpError.InternalServerErrorError);

    expect(() => {
      throw new httpError.NotImplementedError();
    }).toThrowError(httpError.NotImplementedError);

    expect(() => {
      throw new httpError.BadGatewayError();
    }).toThrowError(httpError.BadGatewayError);

    expect(() => {
      throw new httpError.ServiceUnavailableError();
    }).toThrowError(httpError.ServiceUnavailableError);

    expect(() => {
      throw new httpError.GatewayTimeoutError();
    }).toThrowError(httpError.GatewayTimeoutError);
  })
});
