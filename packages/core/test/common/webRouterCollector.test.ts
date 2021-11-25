import { WebRouterCollector, MidwayContainer } from '../../src';
import { join } from 'path';
import { clearAllModule } from '@midwayjs/decorator';
import { matchObjectPropertyInArray } from '../util';

describe('/test/common/webRouterCollector.test.ts', function () {

  it('should test generate router', async () => {
    const collector = new WebRouterCollector(join(__dirname, '../fixtures/base-app-controller'));
    const result = await collector.getRouterTable();
    expect(result.size).toEqual(3);

    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(3);
  });

  it('should test generate flatten router', async () => {
    const collector = new WebRouterCollector(join(__dirname, '../fixtures/base-app-controller'));
    const result = await collector.getFlattenRouterTable();
    expect(result.length > 0).toBeTruthy();
  });

  it('should test with function router', async () => {
    clearAllModule();
    // clearContainerCache();
    const collector = new WebRouterCollector(join(__dirname, '../fixtures/base-app-func-router'), { includeFunctionRouter: true});
    const result = await collector.getFlattenRouterTable();
    expect(result.length).toEqual(4);
    expect(matchObjectPropertyInArray(result, {
      'controllerId': 'helloHttpService',
      'funcHandlerName': 'helloHttpService.upload',
      'handlerName': 'helloHttpService.upload',
      'method': 'upload',
      'prefix': '/',
      'requestMethod': 'get',
      'routerName': '',
      'url': '/upload',
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "prefix": "/",
      "url": "/update",
      "requestMethod": "post",
      "method": "invoke",
      "handlerName": "helloHttpService.invoke",
      "funcHandlerName": "helloHttpService.invoke",
      "controllerId": "helloHttpService",
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "prefix": "/",
      "url": "/invoke",
      "requestMethod": "get",
      "method": "invoke",
      "handlerName": "helloHttpService.invoke",
      "funcHandlerName": "helloHttpService.invoke",
      "controllerId": "helloHttpService",
    })).toBeTruthy();
  });

  it('should sort param', function () {
    const collector = new WebRouterCollector();
    const result = collector.sortRouter(require('../util/fixtures/router').routerList1);
    expect(result[0].url).toEqual('/json');
    expect(result[1].url).toEqual('/');
    expect(result[2].url).toEqual('/:abc/123');
    expect(result[3].url).toEqual('/:fileName');
    expect(result[4].url).toEqual('/abc/*');
    expect(result[5].url).toEqual('/*');
  });

  it('should sort wildcard', function () {
    const collector = new WebRouterCollector();
    const result = collector.sortRouter(require('../util/fixtures/router').routerList2);
    expect(result[0].url).toEqual('/update');
    expect(result[1].url).toEqual('/');
    expect(result[2].url).toEqual('/*');
  });

  it('fix issue 1008', function () {
    const collector = new WebRouterCollector();
    const result1 = collector.sortRouter(require('../util/fixtures/router').routerList3);
    expect(result1[0].url).toEqual('/:page/page');
    expect(result1[1].url).toEqual('/page/:page');
    expect(result1[2].url).toEqual('/:category/:slug');

    const result2 = collector.sortRouter(require('../util/fixtures/router').routerList4);
    expect(result2[0].url).toEqual('/page/:page');
    expect(result2[1].url).toEqual('/:page/page');
    expect(result2[2].url).toEqual('/:category/:slug');
  });

  it('should test global prefix', async () => {
    clearAllModule();
    const container = new MidwayContainer();
    container.bindClass(require('../util/fixtures/home'));
    const collector = new WebRouterCollector('', { globalPrefix: 'api'});
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
    container.bindClass(require('../util/fixtures/prefix-normal'));
    const collector = new WebRouterCollector('', { globalPrefix: 'api'});
    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(2);
  });

  it('fix issue 1382', function () {
    const collector = new WebRouterCollector();
    const result1 = collector.sortRouter(require('./router').routerList5);
    expect(result1[0].url).toEqual('/detail/:id.html');
    expect(result1[1].url).toEqual('/:typeid/:area/');
  });
});
