import { attachPropertyDataToClass, WEB_ROUTER_PARAM_KEY } from '../common';

export interface GetFileStreamOptions {
  requireFile?: boolean; // required file submit, default is true
  defCharset?: string;
  limits?: {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  };
  checkFile?(
    fieldname: string,
    file: any,
    filename: string,
    encoding: string,
    mimetype: string
  ): void | Error;
}

export interface GetFilesStreamOptions extends GetFileStreamOptions {
  autoFields?: boolean;
}

export enum RouteParamTypes {
  QUERY,
  BODY,
  PARAM,
  HEADERS,
  SESSION,
  FILESTREAM,
  FILESSTREAM,
  NEXT,
}

export interface RouterParamValue {
  index?: number;
  type?: RouteParamTypes;
  data?: any;
  extractValue?: (ctx, next) => Promise<any>;
}

export const extractValue = function extractValue(key, data) {
  return async function (ctx, next) {
    switch (key) {
      case RouteParamTypes.NEXT:
        return next;
      case RouteParamTypes.BODY:
        return data && ctx.request.body ? ctx.request.body[data] : ctx.request.body;
      case RouteParamTypes.PARAM:
        return data ? ctx.params[data] : ctx.params;
      case RouteParamTypes.QUERY:
        return data ? ctx.query[data] : ctx.query;
      case RouteParamTypes.HEADERS:
        return data ? ctx.headers[data] : ctx.headers;
      case RouteParamTypes.SESSION:
        return ctx.session;
      case RouteParamTypes.FILESTREAM:
        return ctx.getFileStream && ctx.getFileStream(data);
      case RouteParamTypes.FILESSTREAM:
        return ctx.multipart && ctx.multipart(data);
      default:
        return null;
    }
  };
};

const createParamMapping = function (type: RouteParamTypes) {
  return (data?: any) => (target, key, index) => {
    attachPropertyDataToClass(WEB_ROUTER_PARAM_KEY, {
      index,
      type,
      data,
      extractValue: extractValue(type, data)
    }, target, key);
  };
};

export const Session = () => createParamMapping(RouteParamTypes.SESSION)();
export const Body = (property?: string) => createParamMapping(RouteParamTypes.BODY)(property);
export const Query = (property?: string) => createParamMapping(RouteParamTypes.QUERY)(property);
export const Param = (property?: string) => createParamMapping(RouteParamTypes.PARAM)(property);
export const Headers = (property?: string) => createParamMapping(RouteParamTypes.HEADERS)(property);
export const File = (property?: GetFileStreamOptions) => createParamMapping(RouteParamTypes.FILESTREAM)(property);
export const Files = (property?: GetFilesStreamOptions) => createParamMapping(RouteParamTypes.FILESSTREAM)(property);
