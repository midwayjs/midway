import { WebRouterCollector } from '../src';
import { join } from 'path';
import { clearAllModule } from '@midwayjs/decorator';
import { clearContainerCache } from '../src';
import { matchObjectPropertyInArray } from './util';

describe('/test/webRouterCollector.test.ts', function () {

  it('should test generate router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-controller'));
    const result = await collector.getRouterTable();
    expect(result.size).toEqual(3);

    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(3);
  });

  it('should test generate flatten router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-controller'));
    const result = await collector.getFlattenRouterTable();
    expect(result.length > 0).toBeTruthy();
  });

  it('should test with function router', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-func-router'), { includeFunctionRouter: true});
    const result = await collector.getFlattenRouterTable();
    expect(result.length).toEqual(6);
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

    expect(matchObjectPropertyInArray(result, {
      "prefix": "/",
      "url": "/other",
      "requestMethod": "all",
      "method": "handler",
      "handlerName": "helloHttpService.handler",
      "funcHandlerName": "http.handler",
      "controllerId": "helloHttpService",
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "prefix": "/",
      "url": "/",
      "requestMethod": "get",
      "method": "upload",
      "handlerName": "helloHttpService.upload",
      "funcHandlerName": "http.upload",
      "controllerId": "helloHttpService",
    })).toBeTruthy();

  });

  it('should sort param', function () {
    const collector = new WebRouterCollector();
    const result = collector.sortRouter(require('./router').routerList1);
    expect(result[0].url).toEqual('/json');
    expect(result[1].url).toEqual('/');
    expect(result[2].url).toEqual('/:abc/123');
    expect(result[3].url).toEqual('/:fileName');
    expect(result[4].url).toEqual('/abc/*');
    expect(result[5].url).toEqual('/*');
  });

  it('should sort wildcard', function () {
    const collector = new WebRouterCollector();
    const result = collector.sortRouter(require('./router').routerList2);
    expect(result[0].url).toEqual('/update');
    expect(result[1].url).toEqual('/');
    expect(result[2].url).toEqual('/*');
  });
});
