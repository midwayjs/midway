import { attachMethodDataToClass } from 'injection';

export enum RouteParamTypes {
    QUERY,
    BODY,
    PARAM,
    CONTEXT,
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

export const ROUTE_ARGS_METADATA = '__routeArgsMetadata__';

export const extractValue = function extractValue(key, data) {
  return async function(ctx, next) {
    switch (key) {
      case RouteParamTypes.NEXT:
        return next;
      case RouteParamTypes.CONTEXT:
        return ctx;
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

function createParamMapping(type: RouteParamTypes) {
    return (data?: any) => {
      return (target, key, index) => {
        attachMethodDataToClass(ROUTE_ARGS_METADATA, {
          index,
          type,
          data,
          extractValue: extractValue(type, data)
        }, target, key);
      };
    };
  }

export const ctx = createParamMapping(RouteParamTypes.CONTEXT);
export const body = createParamMapping(RouteParamTypes.BODY);
export const param = createParamMapping(RouteParamTypes.PARAM);
export const query = createParamMapping(RouteParamTypes.QUERY);
export const session = createParamMapping(RouteParamTypes.SESSION);
export const headers = createParamMapping(RouteParamTypes.HEADERS);
export const file = createParamMapping(RouteParamTypes.FILESTREAM);
export const files = createParamMapping(RouteParamTypes.FILESSTREAM);
