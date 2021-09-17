import { ServerlessTriggerCollector } from '../../src';
import { join } from 'path';
import { clearAllModule } from '@midwayjs/decorator';
import { matchObjectPropertyInArray } from '../util';

describe('/test/util/triggerCollector.test.ts', function () {

  it('should test with function router', async () => {
    clearAllModule();
    const collector = new ServerlessTriggerCollector(join(__dirname, '../fixtures/base-app-func-router/src'));
    const result = await collector.getFunctionList();

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
      "requestMetadata": [
        {
          "index": 0,
          "propertyData": "name",
          "type": 0
        }
      ],
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
      'requestMetadata': [
        {
          'index': 0,
          'propertyData': 'event',
          'type': 1,
        },
      ],
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
    clearAllModule();
    const collector = new ServerlessTriggerCollector(join(__dirname, '../fixtures/app-with-serverless-trigger/src'));
    const result = await collector.getFunctionList();
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
    clearAllModule();
    const collector = new ServerlessTriggerCollector(join(__dirname, '../fixtures/app-with-duplicate-router/src'));
    await expect(collector.getFunctionList()).rejects.toThrow('Duplicate router')
  });

});
