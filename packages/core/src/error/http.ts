import { MidwayBaseError } from './base';

export class HttpException extends MidwayBaseError {
  constructor(message: string, httpCode: number) {
    super(message, httpCode);
  }
}

export class BadRequestException extends HttpException {}

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
