import { ALL, RouteParamTypes } from '../decorator';
import { transformRequestObjectByType } from './index';

export const extractKoaLikeValue = (key, data, paramType?) => {
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
        if (ctx.getFileStream) {
          return ctx.getFileStream(data);
        } else if (ctx.files) {
          return ctx.files[0];
        } else {
          return undefined;
        }
      case RouteParamTypes.FILESSTREAM:
        if (ctx.multipart) {
          return ctx.multipart(data);
        } else if (ctx.files) {
          return ctx.files;
        } else {
          return undefined;
        }
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
      case RouteParamTypes.FIELDS:
        return data ? ctx.fields[data] : ctx.fields;
      case RouteParamTypes.CUSTOM:
        return data ? data(ctx) : undefined;
      default:
        return null;
    }
  };
};

export const extractExpressLikeValue = (key, data, paramType?) => {
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
        return req.files ? req.files[0] : undefined;
      case RouteParamTypes.FILESSTREAM:
        return req.files;
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
      case RouteParamTypes.FIELDS:
        return data ? req.fields[data] : req.fields;
      case RouteParamTypes.CUSTOM:
        return data ? data(req, res) : undefined;
      default:
        return null;
    }
  };
};
