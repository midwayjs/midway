
import { expect } from 'chai';
import { Param, Session, Query, Body, Headers, File, Files, WEB_ROUTER_PARAM_KEY, RouteParamTypes } from '@midwayjs/decorator';
import { getPropertyDataFromClass, extractKoaLikeValue } from '../src';

class Test {
  async doget(@Param('aa')aa: any,
              @Query('bb') query: any,
              @Body('body') body: any,
              @Headers('tt') tt: any,
              @File({requireFile: true}) f: any,
              @Files() files: any,
              @Session() bb: any) {

  }
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = getPropertyDataFromClass(WEB_ROUTER_PARAM_KEY, Test, 'doget');
    expect(meta.length).eq(7);
  });

  it('extractValue shoule be ok', async () => {
    let fn = extractKoaLikeValue(RouteParamTypes.NEXT, {});
    expect(await fn({}, 'next')).eq('next');

    fn = extractKoaLikeValue(RouteParamTypes.BODY, 'aaa');
    expect(await fn({request: { body : {aaa: 111}}}, 'next')).eq(111);
    fn = extractKoaLikeValue(RouteParamTypes.BODY, null);
    expect(await fn({request: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.PARAM, 'body');
    expect(await fn({params: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.PARAM, null);
    expect(await fn({params: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.QUERY, 'body');
    expect(await fn({query: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.QUERY, null);
    expect(await fn({query: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.HEADERS, 'body');
    expect(await fn({headers: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractKoaLikeValue(RouteParamTypes.HEADERS, null);
    expect(await fn({headers: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.SESSION, null);
    expect(await fn({session: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractKoaLikeValue(RouteParamTypes.FILESTREAM, 'filestream');
    expect(await fn({
      getFileStream(data) {
        return {body: {aaa: 111}, data};
      }
    }, 'next')).deep.eq({ body : {aaa: 111}, data: 'filestream'});

    fn = extractKoaLikeValue(RouteParamTypes.FILESSTREAM, 'filesstream');
    expect(await fn({
      multipart(data) {
        return {body: {aaa: 111}, data};
      }
    }, 'next')).deep.eq({ body : {aaa: 111}, data: 'filesstream'});
    fn = extractKoaLikeValue('ttt', 'any');
    expect(await fn('', '')).null;
  });
});
