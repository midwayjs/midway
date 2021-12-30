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

/**
 * 400 http error, Means that the request can be fulfilled because of the bad syntax.
 */
export class BadRequestError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Bad Request') {
    super(resOrMessage, HttpStatus.BAD_REQUEST);
  }
}

/**
 * 401 http error, Means that the request was legal, but the server is rejecting to answer it. For the use when authentication is required and has failed or has not yet been provided.
 */
export class UnauthorizedError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Unauthorized') {
    super(resOrMessage, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * 	4o4 http error, Means that the requested page cannot be found at the moment, but it may be available again in the future.
 */
export class NotFoundError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Not Found') {
    super(resOrMessage, HttpStatus.NOT_FOUND);
  }
}

/**
 * 403 http error, Means that the request is legal, but the server is rejecting to answer it.
 */
export class ForbiddenError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Forbidden') {
    super(resOrMessage, HttpStatus.FORBIDDEN);
  }
}

/**
 * 406 http error, Means that the server can only generate an answer which the client doesn't accept.
 */
export class NotAcceptableError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Not Acceptable') {
    super(resOrMessage, HttpStatus.NOT_ACCEPTABLE);
  }
}

/**
 * 408 http error, Means that the server timed out waiting for the request.
 */
export class RequestTimeoutError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Request Timeout') {
    super(resOrMessage, HttpStatus.REQUEST_TIMEOUT);
  }
}

/**
 * 409 http error, Means that the request cannot be completed, because of a conflict in the request.
 */
export class ConflictError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Conflict') {
    super(resOrMessage, HttpStatus.CONFLICT);
  }
}

/**
 * 410 http error, Means that the requested page is not available anymore.
 */
export class GoneError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Gone') {
    super(resOrMessage, HttpStatus.GONE);
  }
}

/**
 * 413 http error, Means that the request entity is too large and that's why the server won't accept the request.
 */
export class PayloadTooLargeError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Request Entity Too Large') {
    super(resOrMessage, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}

/**
 * 415 http error, Means that the media type is not supported and that's why the server won't accept the request.
 */
export class UnsupportedMediaTypeError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Unsupported Media Type') {
    super(resOrMessage, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

export class UnprocessableError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Unprocessable Entity') {
    super(resOrMessage, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

/**
 * 500 http error, Is a generic error and users receive this error message when there is no more suitable specific message.
 */
export class InternalServerErrorError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Internal Server Error') {
    super(resOrMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 501 http error, Means that the server doesn't recognize the request method or it lacks the ability to fulfill the request.
 */
class NotImplementedError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Not Implemented') {
    super(resOrMessage, HttpStatus.NOT_IMPLEMENTED);
  }
}

/**
 * 502 http error, Means that the server was acting as a gateway or proxy and it received an invalid answer from the upstream server.
 */
export class BadGatewayError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Bad Gateway') {
    super(resOrMessage, HttpStatus.BAD_GATEWAY);
  }
}

/**
 * 503 http error, Means that the server is not available now (It may be overloaded or down).
 */
export class ServiceUnavailableError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Service Unavailable') {
    super(resOrMessage, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

/**
 * 504 http error, Means that the server was acting as a gateway or proxy and it didn't get answer on time from the upstream server.
 */
export class GatewayTimeoutError extends MidwayHttpError {
  constructor(resOrMessage: ResOrMessage = 'Gateway Timeout') {
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
