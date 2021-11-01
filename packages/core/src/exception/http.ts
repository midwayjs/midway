import { HttpStatus } from './code';

export class HttpException extends Error {
  status: number;

  constructor(response, status) {
    super();
    this.message = typeof response === 'string' ? response : response.message;
    this.status = status;
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends HttpException {
  constructor(response) {
    super(response, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends HttpException {}

export class NotFoundException extends HttpException {}

export class ForbiddenException extends HttpException {}

export class NotAcceptableException extends HttpException {}

export class RequestTimeoutException extends HttpException {}

export class ConflictException extends HttpException {}

export class GoneException extends HttpException {}

export class PayloadTooLargeException extends HttpException {}

export class UnsupportedMediaTypeException extends HttpException {}

export class UnprocessableException extends HttpException {}

export class InternalServerErrorException extends HttpException {}

class NotImplementedException extends HttpException {}

export class BadGatewayException extends HttpException {}

export class ServiceUnavailableException extends HttpException {}

export class GatewayTimeoutException extends HttpException {}

export const http = {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  NotAcceptableException,
  RequestTimeoutException,
  ConflictException,
  GoneException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  UnprocessableException,
  InternalServerErrorException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
};
