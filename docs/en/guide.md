---
nav: default
---

# Midway Development Guide

## Introduction

Since 2013, Midway has kept upgrading almost every year, from Express to Koa1/2 without absence of trend.

Nowadays, Node.js goes ahead of the simple single-page application, not only in the Alibaba Group but also the Community, and go toward to the full-stack. With this trending, the MidwayJs Team come with the responsibility of supporting the Alibaba Group's Node.js Applications, and we also provide tools like `Pandora.js`, `Sandbox` to help Applications become more stable and reliable.

During 2017, we upgraded the Midway core to Koa2 to support async/await by Midway v5.3 inside the Alibaba Group.
''
At the same year, we started planning to separate the monitoring and statistic function from the framework, which became the Pandora.js, a tool that is not just serve the Midway, but can be general using for any Node.js applications.

In 2018, the MidwayJs Team improved the development experience from the language level by Typescript, and released Midway v6.0 which is the 1.0 open source version to community.

As for the reason why we choose Typescript, this [post](https://juejin.im/post/59c46bc86fb9a00a4636f939) may give you answer.

## About

The Midway is a full-stack development solution which developed by the frontend team of Taobao technique department (i.e. Taobao UED). It cooperate with Pandora and Sandbox to perfect the Node.js development experience in new scene.

## Quickly start

### Install Node.js

Visit the office website of Node.js or using the tools like nvm.

### New project

Using the [midway-init](https://www.npmjs.com/package/midway-init) tool to automatic create a Midway Application directory:

```bash
$ npm i midway-init -g
$ midway-init
```

We can use the `npm scripts` commands to startup:

```bash
$ npm install
$ npm run dev
```

### Directory structure

The structure of Midway is similar to Eggjs, but there are still differences:

* TypeScript code is located in `src/`, and built out `dist/`.
* The original `app/` is moved to `src/app/`.
* It is suggested that write your business logic to the `lib/`, such as `lib/service`.

```plain
➜  midway6-test tree -I node_modules
.
├── README.md
├── README.zh-CN.md
├── dist                                ---- built source code
├── logs                                ---- local logs
│   └── midway6-test                    ---- logs about application name
│       ├── common-error.log            ---- error logs
│       ├── midway-agent.log            ---- agent logs
│       ├── midway-core.log             ---- framework level logs
│       ├── midway-web.log              ---- koa logs
│       └── midway6-test-web.log
├── package.json
├── src                                 ---- source code
│   ├── app                             ---- web application
│   │   ├── controller                  ---- web controllers
│   │   │   ├── home.ts
│   │   │   └── user.ts
│   │   ├── middleware (opt)            ---- web middleware
│   │   │   └── trace.ts
│   │   ├── public (opt)                ---- web static resource
│   │   ├── view (opt)
│   │   |   └── home.tpl                ---- web templates
│   ├── config
│   │   ├── config.default.ts
│   │   ├── config.local.ts
│   │   ├── config.prod.ts
│   │   ├── config.unittest.ts
│   │   └── plugin.ts
│   └── lib                             ---- business logics (user define)
│   │   └── service                     ---- services (user define)
│   │       └── user.ts
│   ├── interface.ts                    ---- interface definition (user define)
│   ├── app.ts (opt)                    ---- application extend file
│   └── agent.ts (opt)                  ---- agent extend file
├── test
│   └── app
│       └── controller
│           └── home.test.ts
├── tsconfig.json
└── tslint.json
```

 Cause the Midway is using EggJs as Web container which means the MVC works it under it's system. so there are some implicit directory rules:

* `src/app/router.ts`( optional) to config the URL route rules, see [Router](https://eggjs.org/en/basics/router.html) for more.
* `src/app/controller/**` to write controllers, see  [Controller](https://eggjs.org/en/basics/controller.html) for more.
* `src/app/middleware/**` (optional) to define user middlewares, see  [Middleware](https://eggjs.org/en/basics/middleware.html) for more.
* `src/app/extend/**` (optional) to configure multiple extensions, see [Extend](https://eggjs.org/en/basics/extend.html) for more.
* `src/config/config.{env}.ts` to write config files, see [Config](https://eggjs.org/en/basics/config.html) for more.
* `src/config/plugin.ts` to setup the plugin which you need, see [Plugin](https://eggjs.org/en/basics/plugin.html) for more.
* `test/**` for unit test, see [Unit testing](https://eggjs.org/en/core/unittest.html) for more.
* `src/app.ts` and `agent.ts` (optional) see [Application Startup Configuration](https://eggjs.org/en/basics/app-start.html). As for `agent.js`, see [Agent mechanism](https://eggjs.org/en/core/cluster-and-ipc.html#agent-mechanism) for more.

And for Egg plugins' compatibility, there are also some implicit rules, like:

* `src/app/public/**` (optional) is for static resources, see the inner plugin [egg-static](https://github.com/eggjs/egg-static) for more.
* `src/app/view/**`  (optional) is for templates files which managed by template plugin, see [View Template Rendering](https://eggjs.org/en/core/view.html) for more.

We would find that the source code all locate on `src/`. If you using the `ts` mode, which is default, the compiled `*.js` code will locate in `dist/`.

Actually, the directories except `app/`, which is not necessary to compatible with old things, has no strict or implicit rules under Midway framework. We can freely define directories, like traditional `web, biz, service, manager, dao` etc.

::: tip
With the Midway features like automatic scanner and IoC, we don't need to use fixed directory rules, that make development more flexible.
:::

## Quick Guide

To quickly use the Midway, you need more things like:

* Learn basic Typescript, there is [quick start](ts_start.md).
* Object oriented is recommended, you will feel free if you like `class`.
* Quick look at IoC and decorators, [introduction  of IoC](ioc.md).
* If you wanna know more detail about some implicit function, don't forget the [Egg documents](https://eggjs.org/en/intro/), or report us [issue](https://github.com/midwayjs/midway/issues).

## The same part of Egg

The biggest difference of the Midway and Egg, is the `*.ts` extensions, and the base dir (Midway use `src/`)。

### Runtime Environment

No changes, see [egg doc](https://eggjs.org/en/basics/env.html) for more.

### Config

Midway use `*.ts` as default, see [Configure Runtime Environment](https://eggjs.org/en/basics/env.html#configure-runtime-environment) for more.

```text
src/config
|- config.default.ts
|- config.prod.ts
|- config.unittest.ts
`- config.local.ts
```

### Web middleware

Except files locate on `src/app/middleware` and extension change to `*.ts`, there is no difference, see [Middleware](https://eggjs.org/en/basics/middleware.html) for more.

### Router

There is still `src/app/router.ts` file, but recommend the [router decorator](#router-decorator) of Midway instead of [egg router](https://eggjs.org/en/basics/router.html).

### Extend

Same function with egg but new place `src/app/*.ts` without change, see [Extend](https://eggjs.org/en/basics/extend.html) for more.

### Application Startup Configuration

New palce `src/app.ts`, see [App start](https://eggjs.org/en/basics/app-start.html) for more.

To get the IoC Context in `app.ts`, you could try this.

```ts
// app.js
module.exports = app => {
  app.beforeStart(async () => {

    // Get singleton object by global scope
    const obj = await app.applicationContext.getAsync('xxx');

    // Get object by current request scope
    const ctx = app.createAnonymousContext();
    const obj = await ctx.requestContext.getAsync('xxx');

  });
};
```

## Router & Controller

Midway use the `koa-router` as router solution, and provide more syntactic sugar that users can easyly declare router and controller with decorators by TypeScript.

### Router decorator

In new ts system, our controller directory is `app/controller`, we  write `*.ts` files inside. Such as the `userController.ts` below, we provide  a interface to get user's information.

```typescript
@provide()
@controller('/user')
export class UserController {

  @inject('userService')
  service: IUserService;

  @get('/:id')
  async getUser(ctx): Promise<void> {
    const id: number = ctx.params.id;
    const user: IUserResult = await this.service.getUser({id});
    ctx.body = {success: true, message: 'OK', data: user};
  }
}
```

We can use `@controller` decorator to declare this class as a Controller. And there is function decorator for different request types.

:::tip
Actually, the string in `@controller(string)` is just what we pass to `router.prefix(string)`.
:::

For web request, Midway provide corresponding function decorator of koa-router:

* @get
* @post
* @del
* @put
* @patch
* @options
* @head
* @all

These decorators is for different async functions, and has the similar meaning of koa-router's. Like original koa2 routers, every router method is async, and got koa context as parameter.

```typescript
@get('/:id')
async getUser(ctx, next): Promise<void> {
  // TODO ctx...
}
```

### router binding

As the way in elder framework you can directly use `app/router.ts` file to declare your routers. But with the new IoC feature there are some differences come.

The focus is we need to **get the controllers from container**, then bind it.

In case we have a controller and this controller didn't declare by `@controller`, that means it wouldn't be recognized as a controller by Midway and would not be automatically bind to some router, but if you `@provide` it, it will be loaded by IoC container.

```typescript
// app/controller/api.ts

@provide()
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}
```

As if we want binding this to a router:

```typescript
// app/router.ts

module.exports = function(app) {
  app.get('/api/index', app.generateController('baseApi.index'));
};
```

There is a simply method for this step named `app.generateController` in Midway, and in form of `ClassName.methodName`.

### router priorities

In SPA scene, there always is `/*` router. we could adjust the code line order to sort it in the past, but due to the decorator way, it may be undefined order for some kind of routers. So Midway provide `@priority(priority: number)` for setting the priority. default priority is `0`, we can also set minus number to downgrade.

```ts
@provide()
@priority(-1)
@controller('/')
export class HomeController {

  @get('/hello')
  async index(ctx) {
    ctx.body = 'hello';
  }

  @get('/*')
  async all(ctx) {
    ctx.body = 'world';
  }
}

```

## Enhanced injection

Midway use [injection](http://web.npm.alibaba-inc.com/package/injection) as default IoC tool. Though `@inject` can satisfy most business logic, for framework there are still places to be extended like plugin, config etc.

### Plugin inject

Except the `app.xxx` plugin usage which supported by eggjs, Midway support we to inject a plugin by `@plugin`. If we have a plugin named `plugin2`, we could try the new way:

:::warning Warning
Cause the midway inner plugin is not store in applicationContext, we couldn't use `@inject` for plugin.
:::

```typescript
@provide()
export class BaseService {

  @plugin('plugin2')
  plugin;

}
```

So that we got `this.plugin` in BaseService with `@plugin` by it's name.

::: tip
Plugin is singleton in Midway.
:::

### Get plugin name

A plugin name to retrieve from pluginContext is depending on the plugin implement. Midway would use the property name, which was mounted by plugin, as the basic key.

```js
module.exports = (app) => {
  // what egg plugins usually do
  app.plugin1 = xxxx;
}
```

Then `plugin1` is the plugin key, Midway will automatically store the object to pluginContext while plugin call app.\[#setter\], so that we can inject it to some property in a class by `@plugin`.

### Config inject

In midway, the config of different environment  would be mounted to `app.config`, but not all the business logic need the app object. So we provide `@config` for retrieving the config values.

For example in `config.default.ts`:

```typescript
export const hello = 1;
```

so we can inject it by:

```typescript
@provide()
export class BaseService {

  @config('hello')
  config;   // 1

}
```

So that we can inject the config values into the business logic without coupling.

### Schedule task

The schedule of midawy is based on [egg schedule](https://eggjs.org/en/basics/schedule.html), and provide more typescript and decorator support. The task all store in `lib/schedule`, every file is single schedule task which can be configured the properties and specify jobs. For example:

```typescript
// src/lib/schedule/hello.ts
'use strict';

import { schedule } from 'midway';

@schedule({
  interval: 2333, // 2.333s interval
  type: 'worker', // only run in certain worker
})
export class HelloCron {
  // The detail job while times up
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello');
  }
}
```

PS: The schedule class need `export` to be loadable. And the `.ts` file can `export` multi schedule class except `default class`.

### Logger inject

In the past, logger object is mounted on app.loggers. By configure the config file, we can generate different logger object, like `customLogger`:

```typescript
module.exports = appInfo => {
  return {
    customLogger: {
      xxLogger: {
        file: path.join(appInfo.root, 'logs/xx.log'),
      },
    },
  };
};
```

Then you can get logger object instance by `@logger`.

```typescript
@provide()
export class BaseService {

  @logger('customLogger')
  logger;

}

```

### logger in requestContext

In the latest version, Midway enable requestContext for all objects. During this scope, every object has a default logger object.

::: tip
This logger object is inject into the IoC container at every request come in. So we can use `@inject` to retrieve it. When the `str` of `@inject(str)` is empty, it will use the property name as the `str` to retrieve. In this case, the logger object's key is just `logger`.
:::

```typescript
@provide()
export class BaseService {

  @inject()
  logger;

  // explicit key
  // @inject('logger')
  // logger;
}
```

## Framework Extend

Eggjs provide extensible application/context/request/response. based on it, Midway do some extending on IoC.

### Application 扩展

see [API doc](https://midwayjs.org/midway/api-reference/classes/midwayapplication.html) for more.

**baseDir**

Due to the typescript compiling, Midway's app.baseDir was point to `src/` while develop and point to `dist/` after built start.

**appDir**

because of the changing baseDir, we add a `app.appDir` for retrieving the root directory of application.

**applicationContext**

`app.applicationContext` is for global scope IoC container, and all the singleton object store inside. Usage:

```ts
await app.applicationContext.getAsync('xxx')
```

**pluginContext**

Container for plugin, to store all the plugins which mount on app.

```ts
await app.pluginContext.getAsync('pluginName')
```

### Context extend

**requestContext**

For the context under request, we extend the `requestContext` property. it's similar with `applicationContext`, is a IoC container too. it is used to store the objects during once request, which would be delete while request over.

```ts
await ctx.requestContext.getAsync('xxx')
```

## Application Test

After a lot of practice, we have a standard set of test tools.

* Toolkit: [midway-bin](https://www.npmjs.com/package/midway-bin)
* Framework: mocha
* Assert library: assert/chai
* Mock: [midway-mock](https://www.npmjs.com/package/midway-mock)

### Directory Structure

Test code is demand to be put in `test/` directory, include `fixtures/` and assistant scripts.

Each Test file has to be named by the pattern of `${filename}.test.ts`, ending with `.test.ts`.

For example:

```plain
test
├── controller
│   └── home.test.ts
├── hello.test.ts
└── service
    └── user.test.ts

```

### Test Tool

Consistently using `midway-bin` to launch tests , which automatically loads modules like Mocha, co-mocha, power-assert, nyc into test scripts, so that we can concentrate on writing tests without wasting time on the choice of various test tools or modules.

The only thing you need to do is setting `scripts.test` in `package.json`.

```json
{
  "scripts": {
    "test": "midway-bin test --ts",
    "cov": "midway-bin cov --ts",
  }
}
```

Then tests would be launched by executing `npm test` command.

```bash
npm test

> unittest-example@ test /Users/harry/midwayj/examples/unittest
> midway-bin test --ts

  test/hello.test.ts
    ✓ should work

  1 passing (10ms)

```

### Start test

Before launching, we have to create an instance of App to test code of application-level like Controller, Middleware or Service.

We can easily create an app instance with Mocha's `before` hook through `midway-mock`.

```typescript
// test/controller/home.test.js
const assert = require('assert');
import { mm } from 'midway-mock';

describe('test/controller/home.test.ts', () => {
  let app;
  before(() => {
    // create a current app instance
    app = mm.app();
    // execute tests after app is ready
    return app.ready();
  });
});
```

Now, we have an app instance, and it's the base of all the following tests. See more about app at [mm.app(options)](https://github.com/eggjs/egg-mock#options).

It's redundancy to create an instance in each test file, so we offered an bootstrap file in `midway-mock` to create it conveniently.

```typescript
// test/controller/home.test.ts
import { app, mock, assert } from 'midway-mock/bootstrap';

describe('test/controller/home.test.ts', () => {
  // test cases
});

```

### Controller Test

We could use `app.httpRequest()` to make a real HTTP request to test. And `app.httpRequest()` is a request instance [SuperTest](https://github.com/visionmedia/supertest) encapsulated by midway-mock.

Here is an `app/controller/home.ts` example:

```typescript
import { controller, get, provide } from 'midway';

@provide()
@controller('/')
export class HomeController {
  @get('/')
  async index(ctx) {
    ctx.body = `Welcome to midwayjs!`;
  }
}
```

Then a test for it:

```typescript
import { app, assert } from 'midway-mock/bootstrap';

describe('test/controller/home.test.ts', () => {
  it('should GET /', () => {
    // request `GET /`
    return app
      .httpRequest()
      .get('/')
      .expect('Welcome to midwayjs!') // expect body equals 'Welcome to midwayjs!'
      .expect(200); // expect the http status is 200
  });
});
```

`app.httpRequest()` based on SuperTest supports a majority of HTTP methods such as GET, POST, PUT, and it provides rich interfaces to construct request, such as a JSON POST request.

### Service Test

Cause Midway suggest use IoC way to write service, so it's coding and testing have obvious difference with Eggjs.

Such as `src/lib/service/user.ts`:

```typescript
import { provide } from 'midway';
import { IUserService, IUserOptions, IUserResult } from '../../interface';

// Load the service to IoC container
@provide('userService')
export class UserService implements IUserService {
  async getUser(options: IUserOptions): Promise<IUserResult> {
    return new Promise<IUserResult>((resolve) => {
      // return the user data after 10ms
      setTimeout(() => {
        resolve({
          id: options.id,
          username: 'mockedName',
          phone: '12345678901',
          email: 'xxx.xxx@xxx.com',
        });
      }, 10);
    });
  }
}

```

Write the unit test `test/service/user.test.ts`：

```typescript
import { app, assert } from 'midway-mock/bootstrap';
import { IUserService } from '../../src/interface';

describe('test/service/user.test.ts', () => {
  it('#getUser', async () => {
    // 取出 userService
    const user = await app.applicationContext.getAsync<IUserService>('userService');
    const data = await user.getUser({ id: 1 });
    assert(data.id === 1);
    assert(data.username === 'mockedName');
  });
});

```

app.applicationContext is the application context of IoC Container, we can asynchronizely get the injected service object and use it for testing. Click [midway-test-demo](https://github.com/Lellansin/midway-test-demo) for the whole demo.

## Deployment

### Building

Because Typescript is a language that need to compile, so we could using tools like `ts-node` to develop locally. In server side, we hope using the compiled JavaScript code to run for better performance.

Thanks to the tool `tsc` which provided by Typescript office to do this job. It will auto load the `tsconfig.json` to do some compiler setups, and Midway has provide a template setup in default, but it can be edited by us freely. And, we provide `build` command to help user simply using it.

::: tip
recommend to build in local and try to launch it by `npm run start_build` which could reduce the CI build errors.
:::

```bash
"start_build": "npm run build && NODE_ENV=development midway-bin dev"
```

With start_build command, it will automaticly compile and start the application with code under `dist/`.

If you have some resources to copy to `dist/`, see [Build command](tool_set.md#build-命令) for more.

### file startup

The Midway provide a inner `server.js` file as the application's start entry. In most cases, you can startup the application by directly require this file.

For example, start by pm2:

```js
// xxx.js
require('midway/server');
```

Or through pandora usage, there will be `procfile.js` file automaticly generated, like:

```js
'use strict';

module.exports = pandora => {
  pandora
    .fork('[your app name]', require.resolve('midway/server'));
};
```

### egg-scripts startup

There is a compatible startup way (from egg) by egg-scripts, but without [startup parameters](#startup-parameters)  support.

Please see [egg-scripts deployment](https://eggjs.org/en/core/deployment.html) for more details.

### startup parameters

We design a mechanisms, that configure the server configs in `package.json` with `midway/server` file only.

See [this](https://github.com/eggjs/egg-cluster/blob/master/lib/master.js#L33) for more parameters support, and there are extra params in Midway:

* typescript {boolean} if true, enable ts mode, load `src/` or `dist/` code. it's not necessary to set it manually that Midway will judge it automatically.
* srcDir {string} srouce code directory, default value is `src/`.
* targetDir {string} compiled code directory, default value is `dist/`.

```json
{
  "midway-server-options": {
    "workers": 1,
    "port": 3000
  }
}
```

You can also define it in js or json file instead of package.json:

```js
{
  "midway-server-options": "./server.json"    // xxx.js
}

// in json
{
  "workers": 1
}

// in js
module.exports = {
  workers: 1
}
```

## Others

### Lack of Windows support

Due to some library and plugin dependencies compatible limit, the development experience is not perfect on Windows Platform. So we suggest using the Midway on Mac/Linux first.

We just verified Midway by Node.js v10 under the Windows 10, but there is no office support upon others Windows version.

It's recommended that use the more friendly tools like [Hyper](https://hyper.is/) instead of native CLI.

BTW, cause the env sync of Windows, the default template of Midway may need adjust the environments manually. Such as, the `dev` script of package.json, you may use `set` to explicit setup the env like:

```json
{
  "dev": "set NODE_ENV=local && midway-bin dev --ts"
}
```
