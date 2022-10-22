import {
  createCustomParamDecorator,
  PipeTransform,
  WEB_ROUTER_PARAM_KEY,
} from '../';

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
