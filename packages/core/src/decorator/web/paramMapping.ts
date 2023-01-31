import { createCustomParamDecorator, WEB_ROUTER_PARAM_KEY } from '../';
import { IMidwayContext, PipeUnionTransform } from '../../interface';

export enum RouteParamTypes {
  QUERY,
  BODY,
  PARAM,
  HEADERS,
  SESSION,
  FILESTREAM,
  FILESSTREAM,
  NEXT,
  REQUEST_PATH,
  REQUEST_IP,
  QUERIES,
  FIELDS,
  CUSTOM,
}

export interface RouterParamValue {
  index: number;
  type: RouteParamTypes;
  propertyData?: any;
}

const createParamMapping = function (type: RouteParamTypes) {
  return (propertyData?: any, pipes?: Array<PipeUnionTransform>) => {
    return createCustomParamDecorator(WEB_ROUTER_PARAM_KEY, {
      type,
      propertyData,
      pipes,
    });
  };
};

export declare type KoaLikeCustomParamDecorator<T = unknown> = (
  ctx: IMidwayContext
) => T | Promise<T>;

export declare type ExpressLikeCustomParamDecorator<T = unknown> = (
  req,
  res
) => T | Promise<T>;

export declare type CustomParamDecorator<T = unknown> =
  | KoaLikeCustomParamDecorator<T>
  | ExpressLikeCustomParamDecorator<T>;

export const createRequestParamDecorator = function (
  transform: CustomParamDecorator,
  pipes?: Array<PipeUnionTransform>
) {
  return createParamMapping(RouteParamTypes.CUSTOM)(transform, pipes);
};

export const Session = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.SESSION)(property, pipes);
export const Body = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.BODY)(property, pipes);
export const Query = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.QUERY)(property, pipes);
export const Param = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.PARAM)(property, pipes);
export const Headers = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.HEADERS)(property, pipes);
export const File = (property?: any, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.FILESTREAM)(property, pipes);
export const Files = (property?: any, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.FILESSTREAM)(property, pipes);
export const RequestPath = () =>
  createParamMapping(RouteParamTypes.REQUEST_PATH)();
export const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
export const Queries = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.QUERIES)(property, pipes);
export const Fields = (property?: string, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.FIELDS)(property, pipes);
