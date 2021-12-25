import { createCustomParamDecorator, WEB_ROUTER_PARAM_KEY } from '../../';

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
  return (propertyData?: any) => {
    return createCustomParamDecorator(WEB_ROUTER_PARAM_KEY, {
      type,
      propertyData,
    });
  };
};

export const Session = (property?: string) =>
  createParamMapping(RouteParamTypes.SESSION)(property);
export const Body = (property?: string) =>
  createParamMapping(RouteParamTypes.BODY)(property);
export const Query = (property?: string) =>
  createParamMapping(RouteParamTypes.QUERY)(property);
export const Param = (property?: string) =>
  createParamMapping(RouteParamTypes.PARAM)(property);
export const Headers = (property?: string) =>
  createParamMapping(RouteParamTypes.HEADERS)(property);
export const File = (property?: any) =>
  createParamMapping(RouteParamTypes.FILESTREAM)();
export const Files = (property?: any) =>
  createParamMapping(RouteParamTypes.FILESSTREAM)();
export const RequestPath = () =>
  createParamMapping(RouteParamTypes.REQUEST_PATH)();
export const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
export const Queries = (property?: string) =>
  createParamMapping(RouteParamTypes.QUERIES)(property);
export const Fields = (property?: string) =>
  createParamMapping(RouteParamTypes.FIELDS)(property);
