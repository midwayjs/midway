import { ALL, RouteParamTypes } from '@midwayjs/decorator';
import { transformRequestObjectByType } from './index';

export const extractKoaLikeValue = (key, data, paramType) => {
  if (ALL === data) {
    data = undefined;
  }
  return function (ctx, next) {
    switch (key) {
      case RouteParamTypes.NEXT:
        return next;
      case RouteParamTypes.BODY:
        return transformRequestObjectByType(
          data && ctx.request.body ? ctx.request.body[data] : ctx.request.body,
          paramType
        );
      case RouteParamTypes.PARAM:
        return transformRequestObjectByType(
          data ? ctx.params[data] : ctx.params,
          paramType
        );
      case RouteParamTypes.QUERY:
        return transformRequestObjectByType(
          data ? ctx.query[data] : ctx.query,
          paramType
        );
      case RouteParamTypes.HEADERS:
        return transformRequestObjectByType(
          data ? ctx.get(data) : ctx.headers,
          paramType
        );
      case RouteParamTypes.SESSION:
        return transformRequestObjectByType(
          data ? ctx.session[data] : ctx.session,
          paramType
        );
      case RouteParamTypes.FILESTREAM:
        return ctx.getFileStream && ctx.getFileStream(data);
      case RouteParamTypes.FILESSTREAM:
        return ctx.multipart && ctx.multipart(data);
      case RouteParamTypes.REQUEST_PATH:
        return ctx['path'];
      case RouteParamTypes.REQUEST_IP:
        return ctx['ip'];
      case RouteParamTypes.QUERIES:
        if (ctx.queries) {
          return transformRequestObjectByType(
            data ? ctx.queries[data] : ctx.queries,
            paramType
          );
        } else {
          return transformRequestObjectByType(
            data ? ctx.query[data] : ctx.query,
            paramType
          );
        }
      default:
        return null;
    }
  };
};

export const extractExpressLikeValue = (key, data, paramType) => {
  if (ALL === data) {
    data = undefined;
  }
  return function (req, res, next) {
    switch (key) {
      case RouteParamTypes.NEXT:
        return next;
      case RouteParamTypes.BODY:
        return transformRequestObjectByType(
          data && req.body ? req.body[data] : req.body,
          paramType
        );
      case RouteParamTypes.PARAM:
        return transformRequestObjectByType(
          data ? req.params[data] : req.params,
          paramType
        );
      case RouteParamTypes.QUERY:
        return transformRequestObjectByType(
          data ? req.query[data] : req.query,
          paramType
        );
      case RouteParamTypes.HEADERS:
        return transformRequestObjectByType(
          data ? req.get(data) : req.headers,
          paramType
        );
      case RouteParamTypes.SESSION:
        return transformRequestObjectByType(
          data ? req.session[data] : req.session,
          paramType
        );
      case RouteParamTypes.FILESTREAM:
        return req.getFileStream && req.getFileStream(data);
      case RouteParamTypes.FILESSTREAM:
        return req.multipart && req.multipart(data);
      case RouteParamTypes.REQUEST_PATH:
        return req['baseUrl'];
      case RouteParamTypes.REQUEST_IP:
        return req['ip'];
      case RouteParamTypes.QUERIES:
        if (req.queries) {
          return transformRequestObjectByType(
            data ? req.queries[data] : req.queries,
            paramType
          );
        } else {
          return transformRequestObjectByType(
            data ? req.query[data] : req.query,
            paramType
          );
        }
      default:
        return null;
    }
  };
};
