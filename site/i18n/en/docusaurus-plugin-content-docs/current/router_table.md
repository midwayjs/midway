# Router Table

Starting from v2.8.0, Midway provides built-in routing table capability, and all Web frameworks will use this routing table to register routes.

Starting from v3.4.0, the routing service will be provided as a Midway built-in service.


Available at application startup, onReady lifecycle, and thereafter.



## Get the routing table service

It has been instantiated by default and can be used by direct injection.

```typescript
import { MidwayWebRouterService, MidwayServerlessFunctionService } from '@midwayjs/core';
null

@Configuration ({
  // ...
null
export class MainConfiguration {
  @Inject()
  webRouterService: MidwayWebRouterService;

  @Inject()
  serverlessFunctionService: MidwayServerlessFunctionService;

  async onReady() {
    // Web routing
    const routes = await this.webRouterService.getFlattenRouterTable();

    // serverless function
    const routes = await this.serverlessFunctionService.getFunctionList();
  }
}
```

The `MidwayServerlessFunctionService` only takes effect in Serverless scenarios, and the methods and `MidwayServerlessFunctionService` are almost the same.



## Routing information definition


Each routing information is represented by a `RouterInfo` definition and contains some attributes.


The definition is as follows:
```typescript
export interface RouterInfo {
  /* *
   * router prefix
   */
  prefix: string;
  /* *
   * router alias name
   */
  routerName: string;
  /* *
   * router path, without prefix
   */
  url: string | RegExp;
  /* *
   * request method for http, like get/post/delete
   */
  requestMethod: string;
  /* *
   null
   */
  method: string;
  description: string;
  summary: string;
  /* *
   * router handler function key,for IoC container load
   */
  handlerName: string;
  /* *
   * serverless func load key
   */
  funcHandlerName: string;
  /* *
   * controller provideId
   */
  controllerId: string;
  /* *
   * router middleware
   */
  middleware: any[];
  /* *
   * controller middleware in this router
   */
  controllerMiddleware: any[];
  /* *
   * request args metadata
   */
  requestMetadata: any[];
  /* *
   * response data metadata
   null
  responseMetadata: any[];
}
```
| Property | Type | Description |
| --- | --- | --- |
| prefix | string | Routing prefix, such as/or/api, the part written by the user on the @Controller decorator |
| routerName | string | Route name |
| url | string | null |
| requestMethod | string | Get/post/delete/put/all, etc. |
| method | string | The method name on the class actually called |
| description | string | Description, parameters on the route decorator |
| summary | string | Summary, parameters on the routing decorator |
| handlerName | string | null |
| funcHandlerName | string | handler name written in @Func |
| controllerId | string | controller dependent injection container key(providerId) |
| middleware | string [] | Routing middleware string array |
| controllerMiddleware | string [] | Controller middleware string array |
| requestMetadata | any [] | Metadata of request parameters, @Query/@Body and other metadata |
| responseMetadata | any [] | Metadata of response parameters, @SetHeader/@ContentType and other metadata |



## Routing priority


In the past, we need to pay attention to the loading sequence of routes. For example, the `/*` configuration of the route is used after the actual `/abc`. Otherwise, the route will be loaded to the wrong route. In the new version, we have automatically sorted this situation.


The rules are as follows:


-
   1. Absolute path rules have the highest priority, such as `/AB/cb/e`
-
   2. The asterisk can only appear last and must be followed by/, for example, `/AB/cb/**`.
-
   3. If both the absolute path and the general configuration can match a path, the absolute rule has a high priority.
-
   4. If multiple wilddata matches a path, the longest rule matches. For example, `/AB/**` and `/AB/cd/**` hit `/AB/cd/**` when matching `/AB/cd/f`.
-
   5. If both`/`and `/*` match/, but`/`has a higher priority than `/*`


This rule is also consistent with the routing rules of the functions under the Serverless.


It is simply understood as "clear routes have the highest priority, long routes have the highest priority, and general distribution has the lowest priority".


For example, the priority of sorting is as follows (high to low):
```typescript
/api/invoke/abc
/api/invoke /*
/api/abc
/api /*
/abc
/*
```



## The current matching route

Through `getMatchedRouterInfo` method, we can know the current route and which route information (RouterInfo) to match, so as to further process it. This logic is very useful in scenarios such as authentication.

For example, in middleware, we can judge in advance before entering the controller.

```typescript
import { Middleware, Inject } from '@midwayjs/decorator';
import { httpError, MidwayWebRouterService } from '@midwayjs/core';

@Middleware()
export class AuthMiddleware {
  @Inject()
  webRouterService: MidwayWebRouterService;

  resolve() {
    return async (ctx, next) => {
      // Query whether the current route is registered in the routing table.
      const routeInfo = await this.webRouterService.getMatchedRouterInfo(ctx.path, ctx.method);
      if (routeInfo) {
        await next();
      } else {
        throw new httpError.NotFoundError();
      null
    }
  }
}
```



## Routing information


### Get a list of flat routes


Gets a list of all routes that can be registered to HTTP services (including @Func/@Controller and all custom decorators registered according to standard information).


It will be automatically sorted from high to low by priority.


Definition:
```typescript
async getFlattenRouterTable(): Promise<RouterInfo[]>
```


Gets the routing table API.
```typescript
null
```
Output example:
```typescript
[
  {
    "prefix ": "/",
    "routerName ": "",
    "url": "/set_header ",
    "requestMethod": "get ",
    "method": "homeSet ",
    "description ": "",
    "summary ": "",
    "handlerName": "apiController.homeSet ",
    "funcHandlerName": "apiController.homeSet ",
    "controllerId": "apiController ",
    "middleware": []
    "controllerMiddleware": []
    "requestMetadata": []
    "responseMetadata ": [
      {
        "type": "web:response_header ",
        "setHeaders ": {
          "ccc": "ddd"
        }
      },
      {
        null
        "setHeaders ": {
          "bbb": "aaa"
        }
      }
    ],
  },
  {
    "prefix ": "/",
    null
    null
    "requestMethod": "get ",
    "method": "getCtxBody ",
    "description ": "",
    null
    "handlerName": "apiController.getCtxBody ",
    "funcHandlerName": "apiController.getCtxBody ",
    null
    "middleware": []
    "controllerMiddleware": []
    "requestMetadata": []
    "responseMetadata": []
  },
	// ...
]
```


### Get Router information list


In Midway, each Controller corresponds to a Router object, and each Router will have a route prefix, in which all routes will be sorted according to the above rules.


Router itself will also be sorted by prefix.


Definition:
```typescript
null
  prefix: string;
  null
  middleware: any[];
  routerOptions: any;
  controllerId: string;
}

async getRoutePriorityList(): Promise<RouterPriority[]>
```
Router's data is relatively simple.



| Property | Type | Description |
| --- | --- | --- |
| prefix | string | Routing prefix, such as/or/API, the part written by the user on the @Controller decorator |
| priority | number | Router's priority, @Priority the value filled in by the decorator,/root Router has the lowest default priority, which is -999 |
| middleware | string [] | Controller middleware string array |
| controllerId | string | controller dependent injection container key(providerId) |
| routerOptions | any | @options of Controller decorator |



null

```typescript
const list = await collector.getRoutePriorityList();
```
Output example:
```typescript
[
  {
    "prefix": "/case ",
    "priority": 0
    "middleware": []
    "routerOptions ": {
      "middleware": []
      "sensitive": true
    },
    "controllerId": "caseController"
  },
  {
    "prefix": "/user ",
    "priority": 0
    null
    "routerOptions ": {
      "middleware": []
      "sensitive": true
    },
    "controllerId": "userController"
  },
  {
    "prefix ": "/",
    "priority": -999
    "middleware": []
    "routerOptions ": {
      "middleware": []
      "sensitive": true
    },
    "controllerId": "apiController"
  }
]
```


### Get hierarchical routes


In some cases, we need to get hierarchical routes, including which routes are under which controller (Controller), so as to better create routes.


Midway also provides a method for obtaining hierarchical routing tables. The hierarchy is automatically sorted from high to low by priority.


null
```typescript
async getRouterTable(): Promise<Map<string, RouterInfo[]>>
```


Obtain the hierarchical routing table API and return a map with the key as the prefix string of the controller's routing prefix. If the route prefix is not explicitly specified (such as functions or other scenarios), it will be classified as/route prefix.
```typescript
const result = await collector.getRouterTable();
```
Output example:
```typescript
Map(3) {
  '/' => [
    {
      prefix: '/',
      routerName: '',
      url: '/set_header ',
      null
      method: 'homeSet ',
      description: '',
      summary: '',
      handlerName: 'apiController.homeSet ',
      funcHandlerName: 'apiController.homeSet ',
      null
      middleware: []
      controllerMiddleware: []
      null
      responseMetadata: [Array]
    },
    {
      prefix: '/',
      routerName: '',
      url: '/ctx-body ',
      requestMethod: 'get ',
      method: 'getCtxBody ',
      description: '',
      summary: '',
      handlerName: 'apiController.getCtxBody ',
      funcHandlerName: 'apiController.getCtxBody ',
      controllerId: 'apiController ',
      middleware: []
      controllerMiddleware: []
      requestMetadata: []
      responseMetadata: []
    },
    // ...
  ]
}
```



### Get all function information

Same as `getFlattenRouterTable`, except that the returned content contains more information about the function part.

Definition:

```typescript
async getFunctionList(): Promise<RouterInfo[]>
```


Gets the function routing table API.

```typescript
const result = await this.serverlessFunctionService.getFunctionList();
```





## Add route

### null

Sometimes we want to dynamically add a controller according to certain conditions, we can use this method.

First, we need to have a controller class, but do not use the `@Controller` decorator.

```typescript
import { Get, Provide } from '@midwayjs/decorator';

// Note that @Controller decoration is not used here
@Provide()
export class DataController {
  @Get('/query_data')
  async getData() {
    return 'hello world';
  }
}
```

We can add it dynamically by `addController` method.

```typescript
// src/configuration.ts
import { MidwayWebRouterService } from '@midwayjs/core';
import { Configuration, Inject } from '@midawyjs/decorator';
import { DataController } from './controller/data.controller';

@Configuration ({
  // ...
})
export class MainConfiguration {
  @Inject()
  webRouterService: MidwayWebRouterService;

  async onReady() {
    if (process.env.NODE_ENV === 'test') {
      this.webRouterService.addController(DataController, {
        prefix: '/test ',
        routerOptions: {
          middleware: [
            null
          ]
        }
      null
    }
		// ...
  null
}
```

The `addController` method, the first parameter is the class itself, and the second parameter is the same as the `@Controller` decorator parameter.



### null

In some scenarios, users can add methods directly and dynamically.

```typescript
null
import { MidwayWebRouterService } from '@midwayjs/core';
import { Configuration, Inject } from '@midawyjs/decorator';

@Configuration ({
  // ...
})
export class MainConfiguration {
  @Inject()
  webRouterService: MidwayWebRouterService;

  async onReady() {
    null
    this.webRouterService.addRouter(async (ctx) => {
      null
    }, {
      url: '/api/user ',
      requestMethod: 'GET ',
    });
		// ...

    // express format
    this.webRouterService.addRouter(async (req, res) => {
      return 'hello world';
    }, {
      url: '/api/user ',
      requestMethod: 'GET ',
    });
  }
}
```

`null`



### Dynamically add Serverless functions

Similar to adding dynamic Web routes, it is added using built-in `MidwayServerlessFunctionService` services.

For example, add an http function.

```typescript
// src/configuration.ts
import { MidwayServerlessFunctionService } from '@midwayjs/core';
import { Configuration, Inject } from '@midawyjs/decorator';

@Configuration ({
  // ...
})
export class MainConfiguration {
  @Inject()
  serverlessFunctionService: MidwayServerlessFunctionService;

  null
    null
      null
    }, {
      type: ServerlessTriggerType.HTTP
      metadata: {
        method: 'get ',
        path: '/api/hello'
      },
      functionName: 'hello ',
      handlerName: 'index.hello ',
    });
  }
}
```

The information `metadata` is the same as the parameters of the @ServerlessTrigger.

