import { ServerlessTriggerCollector } from '../src';
import { join } from 'path';
import { clearAllModule } from '@midwayjs/decorator';
import { clearContainerCache } from '../src';
import { matchObjectPropertyInArray } from './util';

describe('/test/triggerCollector.test.ts', function () {

  it('should test with function router', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new ServerlessTriggerCollector(join(__dirname, './fixtures/base-app-func-router/src'));
    const result = await collector.getFunctionList();
    expect(result).toEqual([
      {
        "_category": 2,
        "_level": 1,
        "_paramString": "",
        "_pureRouter": "/",
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
      },
      {
        "_category": 2,
        "_level": 1,
        "_paramString": "",
        "_pureRouter": "/upload",
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
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
        "requestMethod": "get",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": "/upload"
      },
      {
        "_category": 2,
        "_level": 1,
        "_paramString": "",
        "_pureRouter": "/update",
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
      },
      {
        "_category": 2,
        "_level": 1,
        "_paramString": "",
        "_pureRouter": "/invoke",
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
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
        'requestMethod': "get",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": "/invoke"
      },
      {
        "_category": 2,
        "_level": 1,
        "_paramString": "",
        "_pureRouter": "/other",
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
        "funcHandlerName": "http.handler",
        "functionName": "helloHttpService-handler",
        "functionTriggerMetadata": {
          "method": "all",
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
      },
      {
        "_category": 2,
        "_level": 1,
        "_paramString": "",
        "_pureRouter": "/",
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
        "funcHandlerName": "http.upload",
        "functionName": "helloHttpService-upload",
        "functionTriggerMetadata": {
          "method": "get",
          "path": "/"
        },
        "functionTriggerName": "http",
        "handlerName": "helloHttpService.upload",
        "method": "upload",
        "middleware": [
          "fmw:upload"
        ],
        "prefix": "/",
        "requestMetadata": [],
        "requestMethod": "get",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": "/"
      },
      {
        "_category": 2,
        "_level": 0,
        "_paramString": "",
        "_pureRouter": "",
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
        "funcHandlerName": "helloHttpService.upload",
        "functionName": "helloHttpService-upload",
        "functionTriggerMetadata": {
          "functionName": "helloHttpService-upload"
        },
        "functionTriggerName": "hsf",
        "handlerName": "helloHttpService.upload",
        "method": "upload",
        "middleware": [],
        "prefix": "/",
        "requestMetadata": [],
        "requestMethod": "",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": ""
      },
      {
        "_category": 2,
        "_level": 0,
        "_paramString": "",
        "_pureRouter": "",
        "controllerId": "helloHttpService",
        "controllerMiddleware": [],
        "description": "",
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
        "method": "invoke",
        "middleware": [],
        "prefix": "/",
        "requestMetadata": [],
        "requestMethod": "",
        "responseMetadata": [],
        "routerName": "",
        "summary": "",
        "url": ""
      }
    ]);
  });

  it('should test with serverless trigger', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new ServerlessTriggerCollector(join(__dirname, './fixtures/app-with-serverless-trigger/src'));
    const result = await collector.getFunctionList();
    console.log(result);

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
  });

});
