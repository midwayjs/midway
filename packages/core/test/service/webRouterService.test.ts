import { createLightFramework } from '../util';
import * as path from 'path';
import { MidwayContainer, MidwayWebRouterService, bindContainer, clearAllModule } from '../../src';

describe('/test/service/webRouterService.test.ts', function () {

  it('should test add router first', async () => {
    const collector = new MidwayWebRouterService();
    collector.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/abc/dddd/efg',
      requestMethod: 'GET',
    });
    const result = await collector.getFlattenRouterTable();
    expect(result).toMatchSnapshot();
  });

  it('should test add router match', async () => {
    const collector = new MidwayWebRouterService();
    collector.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/',
      requestMethod: 'GET',
    });
    collector.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/abc/dddd/*',
      requestMethod: 'GET',
    });
    let routeInfo = await collector.getMatchedRouterInfo('/api', 'get');
    expect(routeInfo).toBeUndefined();

    routeInfo = await collector.getMatchedRouterInfo('/abc/dddd/efg', 'GET');
    expect(routeInfo.url).toEqual('/abc/dddd/*');

    collector.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/*',
      requestMethod: 'GET',
    });
    await collector.getFlattenRouterTable({
      compileUrlPattern: true,
    });
    routeInfo = await collector.getMatchedRouterInfo('/api', 'get');
    expect(routeInfo.url).toEqual('/*')
  });

  it('fix issue 2319', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/issue-2319/src'
    ));
    const collector = await framework.getApplicationContext().getAsync('midwayWebRouterService') as any;
    const fullUrls = (await collector.getFlattenRouterTable()).map(item => {
      return item.fullUrl;
    });
    expect(fullUrls).toMatchSnapshot();
  });

  it('should test generate router and flatten router', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/base-app-controller/src'
    ));
    const midwayWebRouterService = await framework.getApplicationContext().getAsync(MidwayWebRouterService);
    const result = await midwayWebRouterService.getRouterTable();
    expect(result.size).toEqual(3);

    const list = await midwayWebRouterService.getRoutePriorityList();
    expect(list.length).toEqual(3);

    const routes = await midwayWebRouterService.getFlattenRouterTable();
    expect(routes.length).toEqual(14);

    midwayWebRouterService.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/abc/dddd/*',
      requestMethod: 'GET',
    });

    const routes1 = await midwayWebRouterService.getFlattenRouterTable({
      compileUrlPattern: true,
    });
    expect(routes1.length).toEqual(15);

    const matchedRouterInfo = await midwayWebRouterService.getMatchedRouterInfo('/abc/dddd/efg', 'GET');
    delete matchedRouterInfo.id;
    expect(matchedRouterInfo).toMatchSnapshot();
  });

  it('should test duplicate controller and empty options will not throw', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/app-with-duplicate-controller-not-throw/src'
    ));
    const collector = await framework.getApplicationContext().getAsync(MidwayWebRouterService);
    expect(await collector.getFlattenRouterTable()).toBeDefined();
  });

  it('should test duplicate controller prefix and options', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/app-with-duplicate-controller-options/src'
    ));
    const collector = await framework.getApplicationContext().getAsync(MidwayWebRouterService);
    await expect(collector.getFlattenRouterTable()).rejects.toThrow('duplicated controller options');
  });

  it('should test add controller and with router filter', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/app-with-controller-filter/src'
    ));
    const collector = await framework.getApplicationContext().getAsync(MidwayWebRouterService);
    const result = await collector.getFlattenRouterTable();
    expect(result.length).toEqual(1);
  });

  it('should sort param', function () {
    const collector = new MidwayWebRouterService();
    const result = collector.sortRouter(require('./router').routerList1);
    expect(result[0].url).toEqual('/json');
    expect(result[1].url).toEqual('/');
    expect(result[2].url).toEqual('/:abc/123');
    expect(result[3].url).toEqual('/:fileName');
    expect(result[4].url).toEqual('/abc/*');
    expect(result[5].url).toEqual('/*');
  });

  it('should sort wildcard', function () {
    const collector = new MidwayWebRouterService();
    const result = collector.sortRouter(require('./router').routerList2);
    expect(result[0].url).toEqual('/update');
    expect(result[1].url).toEqual('/');
    expect(result[2].url).toEqual('/*');
  });

  it('fix issue 1008', function () {
    const collector = new MidwayWebRouterService({});
    const result1 = collector.sortRouter(require('./router').routerList3);
    expect(result1[0].url).toEqual('/:page/page');
    expect(result1[1].url).toEqual('/page/:page');
    expect(result1[2].url).toEqual('/:category/:slug');

    const result2 = collector.sortRouter(require('./router').routerList4);
    expect(result2[0].url).toEqual('/page/:page');
    expect(result2[1].url).toEqual('/:page/page');
    expect(result2[2].url).toEqual('/:category/:slug');
  });

  it('should test global prefix', async () => {
    clearAllModule();
    const container = new MidwayContainer();
    bindContainer(container);
    container.bindClass(MidwayWebRouterService);
    container.bindClass(require('../util/fixtures/home'));
    const collector = await container.getAsync(MidwayWebRouterService, [{ globalPrefix: 'api'}]);
    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(3);
    expect(list[0].prefix).toEqual('/api/test');
    expect(list[1].prefix).toEqual('/api');
    expect(list[2].prefix).toEqual('/');
    const result = await collector.getFlattenRouterTable();
    expect(result.length).toEqual(4);
    expect(result[3].prefix).toEqual('/');
  });

  it('should test global prefix with router ignore', async () => {
    clearAllModule();
    const container = new MidwayContainer();
    bindContainer(container);
    container.bindClass(MidwayWebRouterService);
    container.bindClass(require('../util/fixtures/prefix-normal'));
    const collector = await container.getAsync(MidwayWebRouterService, [{ globalPrefix: 'api'}]);
    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(2);
  });

  it('fix issue 1382', function () {
    const collector = new MidwayWebRouterService();
    const result1 = collector.sortRouter(require('./router').routerList5);
    expect(result1[0].url).toEqual('/detail/:id.html');
    expect(result1[1].url).toEqual('/:typeid/:area/');
  });

  it('test base param router', function () {
    const collector = new MidwayWebRouterService();
    const result1 = collector.sortRouter(require('./router').routerList6);
    expect(result1[0].url).toEqual('/hello');
    expect(result1[1].url).toEqual('/:slot');
  });

});
