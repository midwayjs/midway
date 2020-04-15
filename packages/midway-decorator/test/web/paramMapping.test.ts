
import { expect } from 'chai';
import { Param, Session, Query, Body, Headers, File, Files, WEB_ROUTER_PARAM_KEY, getPropertyDataFromClass, extractValue, RouteParamTypes } from '../../src';

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
    let fn = extractValue(RouteParamTypes.NEXT, {});
    expect(await fn({}, 'next')).eq('next');

    fn = extractValue(RouteParamTypes.BODY, 'aaa');
    expect(await fn({request: { body : {aaa: 111}}}, 'next')).eq(111);
    fn = extractValue(RouteParamTypes.BODY, null);
    expect(await fn({request: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractValue(RouteParamTypes.PARAM, 'body');
    expect(await fn({params: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractValue(RouteParamTypes.PARAM, null);
    expect(await fn({params: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractValue(RouteParamTypes.QUERY, 'body');
    expect(await fn({query: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractValue(RouteParamTypes.QUERY, null);
    expect(await fn({query: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractValue(RouteParamTypes.HEADERS, 'body');
    expect(await fn({headers: { body : {aaa: 111}}}, 'next')).deep.eq({aaa: 111});
    fn = extractValue(RouteParamTypes.HEADERS, null);
    expect(await fn({headers: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractValue(RouteParamTypes.SESSION, null);
    expect(await fn({session: { body : {aaa: 111}}}, 'next')).deep.eq({ body : {aaa: 111}});
    fn = extractValue(RouteParamTypes.FILESTREAM, 'filestream');
    expect(await fn({
      getFileStream(data) {
        return {body: {aaa: 111}, data};
      }
    }, 'next')).deep.eq({ body : {aaa: 111}, data: 'filestream'});

    fn = extractValue(RouteParamTypes.FILESSTREAM, 'filesstream');
    expect(await fn({
      multipart(data) {
        return {body: {aaa: 111}, data};
      }
    }, 'next')).deep.eq({ body : {aaa: 111}, data: 'filesstream'});
    fn = extractValue('ttt', 'any');
    expect(await fn('', '')).null;
  });
});
