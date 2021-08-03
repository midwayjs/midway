import { ServerlessTriggerCollector } from '../../src';
import { join } from 'path';
import { clearAllModule } from '@midwayjs/decorator';
import { clearContainerCache } from '../../src';
import { matchObjectPropertyInArray } from '../util';

describe('/test/util/triggerCollector.test.ts', function () {

  it('should test with function router', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new ServerlessTriggerCollector(join(__dirname, '../fixtures/base-app-func-router/src'));
    const result = await collector.getFunctionList();
    expect(collector.getApplicationContext()).not.toBeNull();
    expect(collector.getApplicationContext()).not.toBeUndefined();

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
        "functionName": "helloHttpService-upload",
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
      "requestMetadata": [
        {
          "index": 0,
          "propertyData": "name",
          "type": 0
        }
      ],
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "controllerId": "helloHttpService",
      "controllerMiddleware": [],
      "description": "",
      "funcHandlerName": "helloHttpService.invoke",
      "functionName": "helloHttpService-invoke",
      "functionTriggerMetadata": {
        "functionName": "helloHttpService-invoke",
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
      "requestMetadata": [
        {
          "index": 0,
          "propertyData": "event",
          "type": 1
        }
      ],
      "requestMethod": "post",
      "responseMetadata": [],
      "routerName": "",
      "summary": "",
      "url": "/update"
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "controllerId": "helloHttpService",
      "controllerMiddleware": [],
      "funcHandlerName": "helloHttpService.invoke",
      "functionName": "helloHttpService-invoke",
      "functionTriggerMetadata": {
        "functionName": "helloHttpService-invoke",
        "method": "get",
        "path": "/invoke"
      },
      "functionTriggerName": "http",
      "handlerName": "helloHttpService.invoke",
      "method": "invoke",
      'middleware': [],
      'prefix': '/',
      'requestMetadata': [
        {
          'index': 0,
          'propertyData': 'event',
          'type': 1,
        },
      ],
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "controllerId": "helloHttpService",
      "controllerMiddleware": [],
      "funcHandlerName": "http.handler",
      "functionName": "helloHttpService-handler",
      "functionTriggerMetadata": {
        "method": ['get', 'post', 'put', 'delete', 'head', 'patch', 'options'],
        "path": "/other"
      },
      "functionTriggerName": "http",
      "handlerName": "helloHttpService.handler",
      "method": "handler",
      "middleware": [
        "auth"
      ],
      "prefix": "/",
      "requestMetadata": [],
      "requestMethod": "all",
      "responseMetadata": [],
      "routerName": "",
      "summary": "",
      "url": "/other"
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "controllerId": "helloHttpService",
      "controllerMiddleware": [],
      "funcHandlerName": "http.upload",
      "functionName": "helloHttpService-upload",
      "functionTriggerMetadata": {
        "method": "get",
        "path": "/"
      },
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "funcHandlerName": "helloHttpService.upload",
      "functionName": "helloHttpService-upload",
      "functionTriggerMetadata": {
        "functionName": "helloHttpService-upload"
      },
      "functionTriggerName": "hsf",
      "handlerName": "helloHttpService.upload",
      "method": "upload",
    })).toBeTruthy();

    expect(matchObjectPropertyInArray(result, {
      "funcHandlerName": "helloHttpService.invoke",
      "functionName": "helloHttpService-invoke",
      "functionTriggerMetadata": {
        "functionName": "helloHttpService-invoke",
        "payload": "",
        "type": "every",
        "value": "5m"
      },
      "functionTriggerName": "timer",
      "handlerName": "helloHttpService.invoke",
    })).toBeTruthy();
  });

  it('should test with serverless trigger', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new ServerlessTriggerCollector(join(__dirname, '../fixtures/app-with-serverless-trigger/src'));
    const result = await collector.getFunctionList();
    expect(matchObjectPropertyInArray(result, {
      functionName: 'helloAliyunService-handleTimerEvent',
      functionTriggerName: 'timer',
      functionTriggerMetadata: {
        type: 'cron',
        value: '0 0 4 * * *',
        name: 'custom_timer',
        functionName: 'helloAliyunService-handleTimerEvent'
      }
    })).toBeTruthy();
    expect(matchObjectPropertyInArray(result, {
      functionName: 'helloAliyunService-handleEvent',
      functionMetadata: {
        functionName: 'hello_bbb',
        concurrency: 2,
      }
    })).toBeTruthy();
  });

  it('should test duplicate router', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new ServerlessTriggerCollector(join(__dirname, '../fixtures/app-with-duplicate-router/src'));
    await expect(collector.getFunctionList()).rejects.toThrow('Duplicate router')
  });

});
