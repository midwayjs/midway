
import { expect } from 'chai';
import { Get, Post, Options, Head, All, getClassMetadata, WEB_ROUTER_KEY } from '../../src';

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

  @All('/get', { routerName: 'all', middleware: ['hello']})
  async doAll() {
    // ignore
  }
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
        path: '/get',
        requestMethod: 'all',
        routerName: 'all',
        method: 'doAll',
        middleware: [ 'hello' ]
      }
    ]);
  });
});
