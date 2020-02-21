/* eslint-disable @typescript-eslint/no-explicit-any */
import { attachPropertyDataToClass } from 'injection';

import { WEB_ROUTER_PARAM_KEY } from '../constant';


interface GetFileStreamOptions {
  requireFile?: boolean // required file submit, default is true
  defCharset?: string
  limits?: {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  }
  checkFile?(
    fieldname: string,
    file: any,
    filename: string,
    encoding: string,
    mimetype: string
  ): void | Error
}

interface GetFilesStreamOptions extends GetFileStreamOptions {
  autoFields?: boolean
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
  index?: number
  type?: RouteParamTypes
  data?: any
  extractValue?: (ctx, next) => Promise<any>
}

export const extractValue = function extractValue(key, data) {
  return async function(ctx, next) {
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

const createParamMapping = function(type: RouteParamTypes) {
  return (data?: any) => (target, key, index) => {
    attachPropertyDataToClass(WEB_ROUTER_PARAM_KEY, {
      index,
      type,
      data,
      extractValue: extractValue(type, data),
    }, target, key);
  };
};

export const session = () => createParamMapping(RouteParamTypes.SESSION)();
export const body = (property?: string) => createParamMapping(RouteParamTypes.BODY)(property);
export const query = (property?: string) => createParamMapping(RouteParamTypes.QUERY)(property);
export const param = (property?: string) => createParamMapping(RouteParamTypes.PARAM)(property);
export const headers = (property?: string) => createParamMapping(RouteParamTypes.HEADERS)(property);
export const file = (property?: GetFileStreamOptions) => createParamMapping(RouteParamTypes.FILESTREAM)(property);
export const files = (property?: GetFilesStreamOptions) => createParamMapping(RouteParamTypes.FILESSTREAM)(property);
