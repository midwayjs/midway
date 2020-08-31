
import { expect } from 'chai';
import { Get, Post, Options, Head, All, getClassMetadata, WEB_ROUTER_KEY, RequestMapping } from '../../src';

class Test {

  @Get('/get', { routerName: 'get', middleware: ['hello']})
  async doGet() {
    // ignore
  }

  @Post('/get', { routerName: 'post', middleware: ['hello']})
  async doPost() {
    // ignore
  }

  @Options('/get', { routerName: 'options', middleware: ['hello']})
  async doOptions() {
    // ignore
  }

  @Head('/get', { routerName: 'head', middleware: ['hello']})
  async doHead() {
    // ignore
  }

  @All(null, { routerName: 'all' })
  async doAll() {
    // ignore
  }

  async ttt() {}
}

describe('/test/web/requestMapping.test.ts', () => {
  it('requestMapping decorator should be ok', () => {
    const meta = getClassMetadata(WEB_ROUTER_KEY, Test);
    expect(meta).deep.eq([
      {
        path: '/get',
        requestMethod: 'get',
        routerName: 'get',
        method: 'doGet',
        middleware: [ 'hello' ]
      },
      {
        path: '/get',
        requestMethod: 'post',
        routerName: 'post',
        method: 'doPost',
        middleware: [ 'hello' ]
      },
      {
        path: '/get',
        requestMethod: 'options',
        routerName: 'options',
        method: 'doOptions',
        middleware: [ 'hello' ]
      },
      {
        path: '/get',
        requestMethod: 'head',
        routerName: 'head',
        method: 'doHead',
        middleware: [ 'hello' ]
      },
      {
        path: '/',
        requestMethod: 'all',
        routerName: 'all',
        method: 'doAll',
        middleware: undefined
      }
    ]);

    const dd = RequestMapping();
    dd(Test, 'ttt', null);

    const metadd = getClassMetadata(WEB_ROUTER_KEY, Test);
    expect(metadd[metadd.length - 1]).deep.eq({
      path: '/',
      requestMethod: 'get',
      routerName: null,
      method: 'ttt',
      middleware: []
    });

    const bb = RequestMapping({
      METHOD_METADATA: null
    });

    bb(Test, 'ttt', null);
    const metabb = getClassMetadata(WEB_ROUTER_KEY, Test);
    expect(metabb[metabb.length - 1]).deep.eq({
      path: '/',
      requestMethod: 'get',
      routerName: undefined,
      method: 'ttt',
      middleware: undefined
    });
  });
});
