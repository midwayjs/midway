import { ServerlessTriggerCollector } from '../src';
import { join } from 'path';
import { clearAllModule } from '@midwayjs/decorator';
import { clearContainerCache } from '../src';

describe('/test/triggerCollector.test.ts', function () {

  it('should test with function router', async () => {
    clearAllModule();
    clearContainerCache();
    const collector = new ServerlessTriggerCollector(join(__dirname, './fixtures/base-app-func-router'));
    const result = await collector.getFunctionList();
    expect(result).toEqual([
      {
        '_category': 2,
        '_level': 1,
        '_paramString': '',
        '_pureRouter': '/upload',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'helloHttpService.upload',
        'functionName': 'helloHttpService-upload',
        'functionTriggerMetadata': {
          'functionName': 'helloHttpService-upload',
          'method': 'get',
          'path': '/upload'
        },
        'functionTriggerName': 'http',
        'handlerName': 'helloHttpService.upload',
        'method': 'upload',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': 'get',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': '/upload'
      },
      {
        '_category': 2,
        '_level': 1,
        '_paramString': '',
        '_pureRouter': '/update',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'helloHttpService.invoke',
        'functionName': 'helloHttpService-invoke',
        'functionTriggerMetadata': {
          'functionName': 'helloHttpService-invoke',
          'method': 'post',
          'path': '/update'
        },
        'functionTriggerName': 'apigw',
        'handlerName': 'helloHttpService.invoke',
        'method': 'invoke',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': 'post',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': '/update'
      },
      {
        '_category': 2,
        '_level': 1,
        '_paramString': '',
        '_pureRouter': '/invoke',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'helloHttpService.invoke',
        'functionName': 'helloHttpService-invoke',
        'functionTriggerMetadata': {
          'functionName': 'helloHttpService-invoke',
          'method': 'get',
          'path': '/invoke'
        },
        'functionTriggerName': 'http',
        'handlerName': 'helloHttpService.invoke',
        'method': 'invoke',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': 'get',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': '/invoke'
      },
      {
        '_category': 2,
        '_level': 1,
        '_paramString': '',
        '_pureRouter': '/other',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'http.handler',
        'handlerName': 'helloHttpService.handler',
        'method': 'handler',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': 'all',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': '/other'
      },
      {
        '_category': 2,
        '_level': 1,
        '_paramString': '',
        '_pureRouter': '/',
        'controllerId': 'apiController',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'apiController.homeSet',
        'handlerName': 'apiController.homeSet',
        'method': 'homeSet',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': 'get',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': '/'
      },
      {
        '_category': 2,
        '_level': 0,
        '_paramString': '',
        '_pureRouter': '',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'helloHttpService.upload',
        'functionName': 'helloHttpService-upload',
        'functionTriggerMetadata': {
          'functionName': 'helloHttpService-upload'
        },
        'functionTriggerName': 'hsf',
        'handlerName': 'helloHttpService.upload',
        'method': 'upload',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': '',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': ''
      },
      {
        '_category': 2,
        '_level': 0,
        '_paramString': '',
        '_pureRouter': '',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'http.upload',
        'handlerName': 'helloHttpService.upload',
        'method': 'upload',
        'middleware': [
          'fmw:upload'
        ],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': '',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': ''
      },
      {
        '_category': 2,
        '_level': 0,
        '_paramString': '',
        '_pureRouter': '',
        'controllerId': 'helloHttpService',
        'controllerMiddleware': [],
        'description': '',
        'funcHandlerName': 'helloHttpService.invoke',
        'functionName': 'helloHttpService-invoke',
        'functionTriggerMetadata': {
          'functionName': 'helloHttpService-invoke',
          'payload': '',
          'type': 'every',
          'value': '5m'
        },
        'functionTriggerName': 'timer',
        'handlerName': 'helloHttpService.invoke',
        'method': 'invoke',
        'middleware': [],
        'prefix': '/',
        'requestMetadata': [],
        'requestMethod': '',
        'responseMetadata': [],
        'routerName': '',
        'summary': '',
        'url': ''
      }
    ]);
  });

});
