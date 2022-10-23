# Aggregate deployment

Midway provides an aggregate deployment method for HTTP scenarios. Similar to traditional Web applications, Midway deploys multiple routes in the same function container during deployment, which can save cold start time and cost.

Aggregation deployment mode is particularly suitable for traditional mid-background services.

## Create code

Create a code example of an aggregate deployment.

:::caution
We have not yet prepared the aggregated deployment solution for v3.
:::

## Directory structure

The following is the most concise structure of a function, the core will include a `f.yml` standardized function file, and the project structure of TypeScript.

```bash
.
├── f.yml           # standardized spec file
├── package.json    # Project Dependency
├── src
│   └── index.ts    # Function entry
└── tsconfig.json
```

Let's take a brief look at the contents of the document.

- `f.yml` function definition file
- `tsconfig.json` tsc configuration file (no IDE will report an error)
- `src` function source directory
- `src/index.ts` sample function file

## Function file

Let's first take a look at the function file. The traditional function is a `function`. In order to be more in line with the midway system and use our dependency injection, here it is turned into a Class.

Like traditional applications, we still use the `@Controller` decorator to develop aggregated HTTP functions.

The following code exposes three routes. In aggregate deployment mode, only one HTTP function is deployed:

```typescript
import { Inject, Provide, Controller, Get, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
@Controller('/')
export class APIService {
  @Inject()
  ctx: Context;

  @Get('/')
  async hello() {
    return 'Hello Midwayjs';
  }

  @Get('/get')
  async get() {
    return this.ctx.query;
  }

  @Post('/post')
  async post() {
    return this.ctx.method;
  }
}
```

## Function definition file

`f.yml` is the definition file of the function. Through this file, files that can be recognized by different platforms are generated during construction. The contents of the files in the example are as follows.

```yaml
service:
  name: midway-faas-examples ## The function group name, which can be understood as the application name

provider:
  name: aliyun ## Released platform, here is Alibaba Cloud

aggregation: ## Use Aggregate Mode Deployment for HTTP Functions
  all: ## deployed function name
    functionsPattern: ## matching function rules
      - '*'
```

## Local development

The local development of HTTP functions is the same as that of traditional Web. Enter the following command.

```shell
$ npm run dev
$ open http://localhost:7001
```

Midway will start the HTTP server, open the browser, access `[http://127.0.0.1:7001](http://127.0.0.1:7001)`, and the browser will print the `Hello midwayjs` information.

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1615045887650-73a90be7-1d49-4024-82c4-fd6b5192e75e.png#height=384&id=JCH29&margin=%5Bobject%20Object%5D&name=image.png&originHeight=768&originWidth=1268&originalType=binary&ratio=1&size=85174&status=done&style=none&width=634" width="634" />

## Local test

Use the same test method as the application to test. For HTTP functions, use the supertest encapsulated `createHttpRequest` method to create HTTP clients.

The only difference from the application is that the `createFunctionApp` method is used to create a function application (app).

The `createFunctionApp` method is the customization of the `createApp` method in the function scenario (which specifies the `@midwayjs/serverless-app` framework of the function).

:::info
Instead of using the `@midwayjs/faas` framework directly, the `@midwayjs/serverless-app` framework is used because the latter contains a series of steps from gateway simulation to function call.
:::

The HTTP test code is as follows:

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/serverless-app';
import * as assert from 'assert';

describe('test/index.test.ts', () => {
  it('should get /', async () => {
    // create app
    const app = await createFunctionApp<Framework>();

    // make request
    const result = await createHttpRequest(app).get('/');

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello Midwayjs');

    const result2 = await createHttpRequest(app).get('/get').query({ name: 123 });
    // or use assert
    assert.deepStrictEqual(result2.status, 200);
    assert.deepStrictEqual(result2.body.name, '123');

    // close app
    await close(app);
  });
});
```

## The difference with pure functions

A normal function registers a single function on a specific route. The traffic requested by the client will be sent to different function instances. The advantage is that the number of function instances corresponding to each interface may be different. If you call more interfaces, there will be more instances and fewer interfaces will be called.

The disadvantage is that if the number of calls is small, the cold start probability of the function will be large, and the calling time will be significantly larger. Since each function will have overhead, resources will not be reused, and the final charge will also increase.

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618156727582-20f0df7c-9f91-430b-87a6-1796b1ee35e1.png#height=494&id=Rdl50&margin=%5Bobject%20Object%5D&name=image.png&originHeight=988&originWidth=1912&originalType=binary&ratio=1&size=85218&status=done&style=none&width=956" width="956" />

In aggregate deployment, all routes are registered to the `/*` route and distributed by the route code in the framework. All functions share the same container. Any request keeps the container alive, thus greatly reducing the possibility of cold start. At the same time, because the code is multiplexed, the reuse rate of the container is greatly increased, which is more suitable for the scene where the request is balanced in the middle and background and the call amount of the interface is relatively balanced.

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618156735858-4ddb1d49-357d-4cec-8201-b2e49bde4b5f.png#height=456&id=I9ZeD&margin=%5Bobject%20Object%5D&name=image.png&originHeight=912&originWidth=1770&originalType=binary&ratio=1&size=59657&status=done&style=none&width=885" width="885" />

## Function name rule

Using functions deployed in aggregate mode, we generally use `@Controller` decorators or integrated methods for development, which is consistent with traditional Web development and testing.

When building, we will generate `functions` fields in `f.yml`. Generally, users do not need to care about function names, interfaces and other information.

In the case of `@Controller` decorator, the generated function name rule is `providerId_methodName`, that is, the combination of the key and method name that depend on the injection.

For example:

```typescript
@Provide('userService') // <--- takes this name, if not, the default is the hump form of the class name
@Controller('/api')
export class UserService {
  @Get('/get/:id')
  async getUser(@Query() name) {}

  @Post('/create')
  async createUser(@Query() name) {}
}
```

When building, `userService_getUser` and `userService_createUser` functions will be automatically generated and internal routing processing will be done.

The following is the generated YAML pseudo code (actually due to aggregate deployment, it becomes an internal route, and this code will not be created).

```yaml
functions:
	userService_getUser:
  	events:
    	- http:
          method: get
          path: /get/[:id]
  userService_createUser:
  	events:
    	- http:
          method: post
          path: /create
```
