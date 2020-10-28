import {
  Get,
  Post,
  Options,
  Head,
  All,
  getClassMetadata,
  WEB_ROUTER_KEY,
  RequestMapping,
} from '../../src';

class Test {
  @Get('/get', { routerName: 'get', middleware: ['hello'] })
  async doGet() {
    // ignore
  }

  @Post('/get', { routerName: 'post', middleware: ['hello'], summary: 'test post method' })
  async doPost() {
    // ignore
  }

  @Options('/get', { routerName: 'options', middleware: ['hello'], description: 'test option method' })
  async doOptions() {
    // ignore
  }

  @Head('/get', { routerName: 'head', middleware: ['hello'] })
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
    expect(meta).toStrictEqual([
      {
        description: '',
        path: '/get',
        requestMethod: 'get',
        routerName: 'get',
        method: 'doGet',
        middleware: ['hello'],
        summary: '',
      },
      {
        description: '',
        path: '/get',
        requestMethod: 'post',
        routerName: 'post',
        method: 'doPost',
        middleware: ['hello'],
        summary: 'test post method',
      },
      {
        description: 'test option method',
        path: '/get',
        requestMethod: 'options',
        routerName: 'options',
        method: 'doOptions',
        middleware: ['hello'],
        summary: '',
      },
      {
        description: '',
        path: '/get',
        requestMethod: 'head',
        routerName: 'head',
        method: 'doHead',
        middleware: ['hello'],
        summary: '',
      },
      {
        description: '',
        path: '/',
        requestMethod: 'all',
        routerName: 'all',
        method: 'doAll',
        middleware: undefined,
        summary: '',
      },
    ]);

    const dd = RequestMapping();
    dd(Test, 'ttt', null);

    const metadd = getClassMetadata(WEB_ROUTER_KEY, Test);
    expect(metadd[metadd.length - 1]).toStrictEqual({
      description: '',
      path: '/',
      requestMethod: 'get',
      routerName: null,
      method: 'ttt',
      middleware: [],
      summary: '',
    });

    const bb = RequestMapping({
      requestMethod: null,
    });

    bb(Test, 'ttt', null);
    const metabb = getClassMetadata(WEB_ROUTER_KEY, Test);
    expect(metabb[metabb.length - 1]).toStrictEqual({
      description: '',
      path: '/',
      requestMethod: 'get',
      routerName: undefined,
      method: 'ttt',
      middleware: undefined,
      summary: '',
    });
  });
});
