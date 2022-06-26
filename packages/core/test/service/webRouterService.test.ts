import { createLightFramework, matchObjectPropertyInArray } from '../util';
import * as path from 'path';
import { MidwayContainer, MidwayWebRouterService } from '../../src';
import { bindContainer, clearAllModule } from '@midwayjs/decorator';

describe('/test/service/webRouterService.test.ts', function () {

  describe('test web router collector', function () {
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

      midwayWebRouterService.addRouter('/abc/dddd/efg', async (ctx) => {
        return 'hello world';
      }, {
        requestMethod: 'GET',
      });

      const routes1 = await midwayWebRouterService.getFlattenRouterTable();
      expect(routes1.length).toEqual(15);
    });

    it('should test with function router', async () => {
      const framework = await createLightFramework(path.join(
        __dirname,
        '../fixtures/base-app-func-router/src'
      ));
      const midwayWebRouterService = await framework.getApplicationContext().getAsync(MidwayWebRouterService, [{ includeFunctionRouter: true}]);
      const result = await midwayWebRouterService.getFlattenRouterTable();
      expect(result.length).toBeGreaterThanOrEqual(6);
      expect(matchObjectPropertyInArray(result, {
        "controllerId": "apiController",
        "controllerMiddleware": [
          "auth"
        ],
        "description": "",
        "funcHandlerName": "apiController.homeSet",
        "functionName": "apiController-homeSet",
        "functionTriggerMetadata": {
          "method": "get",
          "path": "/api"
        },
        "functionTriggerName": "http",
        "handlerName": "apiController.homeSet",
        "method": "homeSet",
        "middleware": [
          "auth2"
        ],
        "prefix": "/api",
        "requestMetadata": [],
        "requestMethod": "get",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": "/"
      })).toBeTruthy();

      expect(matchObjectPropertyInArray(result, {
        "funcHandlerName": "helloHttpService.upload",
        "functionName": "helloHttpService-upload",
        "functionTriggerMetadata": {
          "method": "get",
          "middleware": [
            "fmw:upload"
          ],
          "path": "/upload"
        },
        "functionTriggerName": "http",
        "handlerName": "helloHttpService.upload",
        "method": "upload",
        "middleware": [
          "fmw:upload",
        ],
        "prefix": "/",
        "functionMetadata": {
          "functionName": "helloHttpService-upload",
        }
      })).toBeTruthy();

      expect(matchObjectPropertyInArray(result, {
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
        "funcHandlerName": "helloHttpService.invoke",
        "functionName": "helloHttpService-invoke",
        "functionTriggerMetadata": {
          "method": "post",
          "middleware": [
            "auth"
          ],
          "path": "/update"
        },
        "functionTriggerName": "apigw",
        "handlerName": "helloHttpService.invoke",
        "method": "invoke",
        "middleware": [
          "auth"
        ],
        "prefix": "/",
        "requestMethod": "post",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": "/update",
        "functionMetadata": {
          "functionName": "helloHttpService-invoke",
        },
      })).toBeTruthy();

      expect(matchObjectPropertyInArray(result, {
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "funcHandlerName": "helloHttpService.invoke",
        "functionName": "helloHttpService-invoke",
        "functionTriggerMetadata": {
          "method": "get",
          "path": "/invoke"
        },
        "functionTriggerName": "http",
        "handlerName": "helloHttpService.invoke",
        "method": "invoke",
        'middleware': [],
        'prefix': '/',
        "functionMetadata": {
          "functionName": "helloHttpService-invoke",
        },
      })).toBeTruthy();

      expect(matchObjectPropertyInArray(result, {
        "funcHandlerName": "helloHttpService.upload",
        "functionName": "helloHttpService-upload",
        "functionTriggerName": "hsf",
        "handlerName": "helloHttpService.upload",
        "method": "upload",
        "functionMetadata": {
          "functionName": "helloHttpService-upload",
        }
      })).toBeTruthy();

      expect(matchObjectPropertyInArray(result, {
        "funcHandlerName": "helloHttpService.invoke",
        "functionName": "helloHttpService-invoke",
        "functionTriggerMetadata": {
          "payload": "",
          "type": "every",
          "value": "5m"
        },
        "functionTriggerName": "timer",
        "handlerName": "helloHttpService.invoke",
        "functionMetadata": {
          "functionName": "helloHttpService-invoke",
        }
      })).toBeTruthy();
    });

    it('should test with serverless trigger', async () => {
      const framework = await createLightFramework(path.join(
        __dirname,
        '../fixtures/app-with-serverless-trigger/src'
      ));
      const collector = await framework.getApplicationContext().getAsync(MidwayWebRouterService, [{ includeFunctionRouter: true}]);
      const result = await collector.getFlattenRouterTable();
      expect(matchObjectPropertyInArray(result, {
        functionName: 'helloAliyunService-handleTimerEvent',
        functionTriggerName: 'timer',
        functionTriggerMetadata: {
          type: 'cron',
          value: '0 0 4 * * *',
          name: 'custom_timer',
        },
        functionMetadata: {
          functionName: 'helloAliyunService-handleTimerEvent'
        }
      })).toBeTruthy();
      expect(matchObjectPropertyInArray(result, {
        functionName: 'hello_bbb',
        functionMetadata: {
          functionName: 'hello_bbb',
          concurrency: 2,
        },
      })).toBeTruthy();
    });

    it('should test duplicate router', async () => {
      const framework = await createLightFramework(path.join(
        __dirname,
        '../fixtures/app-with-duplicate-router/src'
      ));
      const collector = await framework.getApplicationContext().getAsync(MidwayWebRouterService, [{ includeFunctionRouter: true}]);
      await expect(collector.getFlattenRouterTable()).rejects.toThrow('Duplicate router')
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
});
