import { DECORATORS } from '../constants';
import {
  ResponseObject,
  SchemaObject,
  ReferenceObject,
  Type,
} from '../interfaces';
import { getTypeIsArrayTuple } from './helpers';
import { HttpStatus } from '../common/httpStatus';
import { createCustomMethodDecorator } from '@midwayjs/decorator';

export interface ApiResponseMetadata
  extends Omit<ResponseObject, 'description'> {
  status?: number | 'default';
  type?: Type | string | Record<string, any>;
  isArray?: boolean;
  description?: string;
}

export interface ApiResponseSchemaHost
  extends Omit<ResponseObject, 'description'> {
  schema: SchemaObject & Partial<ReferenceObject>;
  status?: number;
  description?: string;
}

export type ApiResponseOptions = ApiResponseMetadata | ApiResponseSchemaHost;

export function ApiResponse(options: ApiResponseOptions): any {
  const [type, isArray] = getTypeIsArrayTuple(
    (options as ApiResponseMetadata).type,
    (options as ApiResponseMetadata).isArray
  );

  (options as ApiResponseMetadata).type = type;
  (options as ApiResponseMetadata).isArray = isArray;
  options.description = options.description ? options.description : '';

  const groupedMetadata = {
    [options.status || 'default']: options,
  };

  return createCustomMethodDecorator(DECORATORS.API_RESPONSE, groupedMetadata, false);
}

export const ApiOkResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.OK,
  });

export const ApiCreatedResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.CREATED,
  });

export const ApiAcceptedResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.ACCEPTED,
  });

export const ApiNoContentResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.NO_CONTENT,
  });

export const ApiMovedPermanentlyResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.MOVED_PERMANENTLY,
  });

export const ApiFoundResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.FOUND,
  });

export const ApiBadRequestResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.BAD_REQUEST,
  });

export const ApiUnauthorizedResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.UNAUTHORIZED,
  });

export const ApiTooManyRequestsResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.TOO_MANY_REQUESTS,
  });

export const ApiNotFoundResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.NOT_FOUND,
  });

export const ApiInternalServerErrorResponse = (
  options: ApiResponseOptions = {}
) =>
  ApiResponse({
    ...options,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  });

export const ApiBadGatewayResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.BAD_GATEWAY,
  });

export const ApiConflictResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.CONFLICT,
  });

export const ApiForbiddenResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.FORBIDDEN,
  });

export const ApiGatewayTimeoutResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.GATEWAY_TIMEOUT,
  });

export const ApiGoneResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.GONE,
  });

export const ApiMethodNotAllowedResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.METHOD_NOT_ALLOWED,
  });

export const ApiNotAcceptableResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.NOT_ACCEPTABLE,
  });

export const ApiNotImplementedResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.NOT_IMPLEMENTED,
  });

export const ApiPreconditionFailedResponse = (
  options: ApiResponseOptions = {}
) =>
  ApiResponse({
    ...options,
    status: HttpStatus.PRECONDITION_FAILED,
  });

export const ApiPayloadTooLargeResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.PAYLOAD_TOO_LARGE,
  });

export const ApiRequestTimeoutResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: HttpStatus.REQUEST_TIMEOUT,
  });

export const ApiServiceUnavailableResponse = (
  options: ApiResponseOptions = {}
) =>
  ApiResponse({
    ...options,
    status: HttpStatus.SERVICE_UNAVAILABLE,
  });

export const ApiUnprocessableEntityResponse = (
  options: ApiResponseOptions = {}
) =>
  ApiResponse({
    ...options,
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  });

export const ApiUnsupportedMediaTypeResponse = (
  options: ApiResponseOptions = {}
) =>
  ApiResponse({
    ...options,
    status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
  });

export const ApiDefaultResponse = (options: ApiResponseOptions = {}) =>
  ApiResponse({
    ...options,
    status: 'default',
  });
