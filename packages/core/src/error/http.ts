import { HttpStatus } from './code';

export class HttpError extends Error {
  status: number;

  constructor(response, status) {
    super();
    this.message = typeof response === 'string' ? response : response.message;
    this.status = status;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(response) {
    super(response, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedError extends HttpError {}

export class NotFoundError extends HttpError {}

export class ForbiddenError extends HttpError {}

export class NotAcceptableError extends HttpError {}

export class RequestTimeoutError extends HttpError {}

export class ConflictError extends HttpError {}

export class GoneError extends HttpError {}

export class PayloadTooLargeError extends HttpError {}

export class UnsupportedMediaTypeError extends HttpError {}

export class UnprocessableError extends HttpError {}

export class InternalServerErrorError extends HttpError {}

class NotImplementedError extends HttpError {}

export class BadGatewayError extends HttpError {}

export class ServiceUnavailableError extends HttpError {}

export class GatewayTimeoutError extends HttpError {}

export const http = {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  NotAcceptableError,
  RequestTimeoutError,
  ConflictError,
  GoneError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  UnprocessableError,
  InternalServerErrorError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
};
