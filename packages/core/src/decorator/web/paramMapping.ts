import {
  createCustomParamDecorator,
  PipeTransform,
  WEB_ROUTER_PARAM_KEY,
} from '../';
import { IMidwayContext } from '../../interface';

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
  return (propertyData?: any, pipes?: PipeTransform[]) => {
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

export const createRequestParamDecorator = function (transform: CustomParamDecorator) {
  return createParamMapping(RouteParamTypes.CUSTOM)(transform);
};

export const Session = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.SESSION)(property);
export const Body = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.BODY)(property);
export const Query = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.QUERY)(property, pipes);
export const Param = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.PARAM)(property, pipes);
export const Headers = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.HEADERS)(property);
export const File = (property?: any, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.FILESTREAM)(property);
export const Files = (property?: any, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.FILESSTREAM)(property);
export const RequestPath = () =>
  createParamMapping(RouteParamTypes.REQUEST_PATH)();
export const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
export const Queries = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.QUERIES)(property);
export const Fields = (property?: string, pipes?: PipeTransform[]) =>
  createParamMapping(RouteParamTypes.FIELDS)(property);
