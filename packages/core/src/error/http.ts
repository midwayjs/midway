import { MidwayHttpError, ResOrMessage } from './base';

export enum HttpStatus {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}

export class BadRequestError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.UNAUTHORIZED);
  }
}

export class NotFoundError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.FORBIDDEN);
  }
}

export class NotAcceptableError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.NOT_ACCEPTABLE);
  }
}

export class RequestTimeoutError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.REQUEST_TIMEOUT);
  }
}

export class ConflictError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.CONFLICT);
  }
}

export class GoneError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.GONE);
  }
}

export class PayloadTooLargeError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}

export class UnsupportedMediaTypeError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

export class UnprocessableError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class InternalServerErrorError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

class NotImplementedError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.NOT_IMPLEMENTED);
  }
}

export class BadGatewayError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.BAD_GATEWAY);
  }
}

export class ServiceUnavailableError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class GatewayTimeoutError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage) {
    super(resOrMessage, HttpStatus.GATEWAY_TIMEOUT);
  }
}

export const httpError = {
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
