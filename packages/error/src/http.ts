import { MidwayBaseError } from './base';

export class BadRequestException extends MidwayBaseError {

}

export class UnauthorizedException extends MidwayBaseError {

}

export class NotFoundException extends MidwayBaseError {

}

export class ForbiddenException extends MidwayBaseError {

}

export class NotAcceptableException extends MidwayBaseError {

}

export class RequestTimeoutException extends MidwayBaseError {

}

export class ConflictException extends MidwayBaseError {

}

export class GoneException extends MidwayBaseError {

}

export class PayloadTooLargeException extends MidwayBaseError {

}

export class UnsupportedMediaTypeException extends MidwayBaseError {

}

export class UnprocessableException extends MidwayBaseError {

}

export class InternalServerErrorException extends MidwayBaseError {

}

class NotImplementedException extends MidwayBaseError {

}


export class BadGatewayException extends MidwayBaseError {

}


export class ServiceUnavailableException extends MidwayBaseError {

}

export class GatewayTimeoutException extends MidwayBaseError {

}

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
}
