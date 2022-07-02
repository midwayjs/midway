import { createLightFramework, matchObjectPropertyInArray } from '../util';
import * as path from 'path';
import { MidwayServerlessFunctionService } from '../../src';
import { ServerlessTriggerType } from '@midwayjs/decorator';

describe('/test/service/slsFunction.test.ts', function () {

  it('should test with function router', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/base-app-func-router/src'
    ));
    const midwayWebRouterService = await framework.getApplicationContext().getAsync(MidwayServerlessFunctionService);
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
    const collector = await framework.getApplicationContext().getAsync(MidwayServerlessFunctionService);
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
    const collector = await framework.getApplicationContext().getAsync(MidwayServerlessFunctionService);
    await expect(collector.getFunctionList()).rejects.toThrow('Duplicate router')
  });

  it('should test dynamic add function', async () => {
    const midwayServerlessFunctionService = new MidwayServerlessFunctionService();
    midwayServerlessFunctionService.addServerlessFunction(async (ctx, event) => {
      return 'hello world';
    }, {
      type: ServerlessTriggerType.HTTP,
      metadata: {
        method: 'get',
        path: '/api/hello'
      },
      functionName: 'hello',
      handlerName: 'index.hello',
    });

    midwayServerlessFunctionService.addServerlessFunction(async (ctx, event) => {
      return 'hello world';
    }, {
      type: ServerlessTriggerType.HSF,
      metadata: {
        name: 'customHSF'
      },
      functionName: 'hsf',
      handlerName: 'index.hsf',
    });

    const result = await midwayServerlessFunctionService.getFunctionList();
    expect(result).toMatchSnapshot();
    expect(typeof result[0].method).toEqual('function');
  });
});
