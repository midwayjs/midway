import { ALL, RouteParamTypes } from '@midwayjs/decorator';

export const extractKoaLikeValue = (key, data) => {
  if (ALL === data) {
    data = undefined;
  }
  return function (ctx, next) {
    switch (key) {
      case RouteParamTypes.NEXT:
        return next;
      case RouteParamTypes.BODY:
        return data && ctx.request.body
          ? ctx.request.body[data]
          : ctx.request.body;
      case RouteParamTypes.PARAM:
        return data ? ctx.params[data] : ctx.params;
      case RouteParamTypes.QUERY:
        return data ? ctx.query[data] : ctx.query;
      case RouteParamTypes.HEADERS:
        return data ? ctx.get(data) : ctx.headers;
      case RouteParamTypes.SESSION:
        return data ? ctx.session[data] : ctx.session;
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
          return data ? ctx.queries[data] : ctx.queries;
        } else {
          return data ? ctx.query[data] : ctx.query;
        }
      default:
        return null;
    }
  };
};

export const extractExpressLikeValue = (key, data) => {
  if (ALL === data) {
    data = undefined;
  }
  return function (req, res, next) {
    switch (key) {
      case RouteParamTypes.NEXT:
        return next;
      case RouteParamTypes.BODY:
        return data && req.body ? req.body[data] : req.body;
      case RouteParamTypes.PARAM:
        return data ? req.params[data] : req.params;
      case RouteParamTypes.QUERY:
        return data ? req.query[data] : req.query;
      case RouteParamTypes.HEADERS:
        return data ? req.get(data) : req.headers;
      case RouteParamTypes.SESSION:
        return data ? req.session[data] : req.session;
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
          return data ? req.queries[data] : req.queries;
        } else {
          return data ? req.query[data] : req.query;
        }
      default:
        return null;
    }
  };
};
