import {  RouteParamTypes } from '@midwayjs/decorator';
import { extractKoaLikeValue, extractExpressLikeValue } from '../src';

describe('/test/web/paramMapping.test.ts', () => {
  it('extract koa value should be ok', async () => {
    let fn = extractKoaLikeValue(RouteParamTypes.NEXT, {});
    expect(await fn({}, 'next')).toEqual('next');

    fn = extractKoaLikeValue(RouteParamTypes.BODY, 'aaa');
    expect(await fn({request: { body : {aaa: 111}}}, 'next')).toEqual(111);
    fn = extractKoaLikeValue(RouteParamTypes.BODY, null);
    expect(await fn({request: { body : {aaa: 111}}}, 'next')).toStrictEqual({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.PARAM, 'body');
    expect(await fn({params: { body : {aaa: 111}}}, 'next')).toStrictEqual({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.PARAM, null);
    expect(await fn({params: { body : {aaa: 111}}}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.QUERY, 'body');
    expect(await fn({query: { body : {aaa: 111}}}, 'next')).toStrictEqual({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.QUERY, null);
    expect(await fn({query: { body : {aaa: 111}}}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.HEADERS, 'body');
    const ctx = {
      headers: { body : {aaa: 111}},
      get(key) {
        return ctx.headers[key];
      }
    };
    expect(await fn(ctx, 'next')).toStrictEqual({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.HEADERS, null);
    expect(await fn({headers: { body : {aaa: 111}}}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.SESSION, null);
    expect(await fn({session: { body : {aaa: 111}}}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.FILESTREAM, 'filestream');
    expect(await fn({
      getFileStream(data) {
        return {body: {aaa: 111}, data};
      }
    }, 'next')).toStrictEqual({ body : {aaa: 111}, data: 'filestream'});

    fn = extractKoaLikeValue(RouteParamTypes.FILESSTREAM, 'filesstream');
    expect(await fn({
      multipart(data) {
        return {body: {aaa: 111}, data};
      }
    }, 'next')).toStrictEqual({ body : {aaa: 111}, data: 'filesstream'});
    fn = extractKoaLikeValue('ttt', 'any');
    expect(await fn('', '')).toBeNull();

    fn = extractKoaLikeValue(RouteParamTypes.REQUEST_PATH, null);
    expect(await fn({path: '/base/api/a.html'}, 'next')).toStrictEqual('/base/api/a.html');

    fn = extractKoaLikeValue(RouteParamTypes.REQUEST_IP, null);
    expect(await fn({ip: '127.0.0.1'}, 'next')).toStrictEqual('127.0.0.1');
  });

  it('extract express value should be ok', async () => {
    let fn = extractExpressLikeValue(RouteParamTypes.NEXT, {});
    expect(await fn({}, {}, 'next')).toEqual('next');

    fn = extractExpressLikeValue(RouteParamTypes.BODY, 'aaa');
    expect(await fn({ body : {aaa: 111}}, {}, 'next')).toEqual(111);
    fn = extractExpressLikeValue(RouteParamTypes.BODY, null);
    expect(await fn({ body : {aaa: 111}}, {}, 'next')).toStrictEqual({aaa: 111});
    fn = extractExpressLikeValue(RouteParamTypes.PARAM, 'body');
    expect(await fn({params: { body : {aaa: 111}}}, {}, 'next')).toStrictEqual({aaa: 111});
    fn = extractExpressLikeValue(RouteParamTypes.PARAM, null);
    expect(await fn({params: { body : {aaa: 111}}}, {}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractExpressLikeValue(RouteParamTypes.QUERY, 'body');
    expect(await fn({query: { body : {aaa: 111}}}, {}, 'next')).toStrictEqual({aaa: 111});
    fn = extractExpressLikeValue(RouteParamTypes.QUERY, null);
    expect(await fn({query: { body : {aaa: 111}}}, {}, 'next')).toStrictEqual({ body : {aaa: 111}});

    const req = {
      headers: { body : {aaa: 111}},
      get(key) {
        return req.headers[key];
      }
    };

    fn = extractExpressLikeValue(RouteParamTypes.HEADERS, 'body');
    expect(await fn(req, {}, 'next')).toStrictEqual({aaa: 111});
    fn = extractExpressLikeValue(RouteParamTypes.HEADERS, null);
    expect(await fn({headers: { body : {aaa: 111}}}, {}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractExpressLikeValue(RouteParamTypes.SESSION, null);
    expect(await fn({session: { body : {aaa: 111}}}, {}, 'next')).toStrictEqual({ body : {aaa: 111}});
    fn = extractExpressLikeValue(RouteParamTypes.FILESTREAM, 'filestream');
    expect(await fn({
      getFileStream(data) {
        return {body: {aaa: 111}, data};
      }
    }, {}, 'next')).toStrictEqual({ body : {aaa: 111}, data: 'filestream'});

    fn = extractExpressLikeValue(RouteParamTypes.FILESSTREAM, 'filesstream');
    expect(await fn({
      multipart(data) {
        return {body: {aaa: 111}, data};
      }
    }, {}, 'next')).toStrictEqual({ body : {aaa: 111}, data: 'filesstream'});
    fn = extractExpressLikeValue('ttt', 'any');
    expect(await fn('', {}, '')).toBeNull();

    fn = extractExpressLikeValue(RouteParamTypes.REQUEST_PATH, null);
    expect(await fn({baseUrl: '/base/api/a.html'}, {}, 'next')).toStrictEqual('/base/api/a.html');

    fn = extractExpressLikeValue(RouteParamTypes.REQUEST_IP, null);
    expect(await fn({ip: '127.0.0.1'}, {}, 'next')).toStrictEqual('127.0.0.1');
  });
});
