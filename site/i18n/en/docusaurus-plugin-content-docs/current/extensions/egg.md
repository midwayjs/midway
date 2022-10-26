# EggJS

Midway can use EggJS as the upper-level Web framework. EggJS provides many commonly used plug-ins and API to help users quickly build enterprise-level Web applications. This chapter mainly introduces how EggJS uses its own capabilities in Midway.

| Description |      |
| ----------------- | ---- |
| Contains independent main framework | ✅ |
| Contains independent logs | ✅ |



## Installation dependency

```bash
$ npm i @midwayjs/web@3 egg --save
$ npm i @midwayjs/egg-ts-helper --save-dev
```

For the EggJS scenario, these packages are listed below.

```json
  "dependencies": {
    "@midwayjs/web": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "egg": "^2.0.0 ",
    "egg-scripts": "^2.10.0"
  },
  "devDependencies": {
    "@midwayjs/egg-ts-helper": "^1.0.1 ",
  },
```

| @midwayjs/web | **Required** ,Midway EggJS adaptation layer |
| ----------------------- | ------------------------------------------ |
| @midwayjs/decorator | **Required** ,Midway series universal decorator package |
| egg | **Required** ,EggJS dependent package, and other capabilities such as definition. |
| egg-scripts | **Optional** ,EggJS startup script |
| @midwayjs/egg-ts-helper | **Optional** ,EggJS defines the generation tool. |

Examples can also be created directly using scaffolding.

```bash
# npm v6
$ npm init midway --type=egg-v3 my_project

# npm v7
$ npm init midway -- --type=egg-v3 my_project
```



## Open the component

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as web from '@midwayjs/web';
import { join } from 'path';

@Configuration({
  imports: [web]
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration {
  @App()
  app: web.Application;

  async onReady() {
		// ...
  }
}

```



## The difference from the default EggJS


- 1. starting from v3, midway provides more components, and most egg built-in plug-ins are disabled by default
- 2. The baseDir is adjusted to `src` directory by default, and the server is `dist` directory.
- 3. disable egg-logger, replace all with @midwayjs/logger, and cannot switch



The entire architecture is as follows:
![](https://cdn.nlark.com/yuque/0/2021/png/501408/1614842824740-fc0c1432-3ace-4f77-b51f-15212984b168.png)


## Directory structure


In addition to the directory structure provided by Midway, EggJS also has some special directory structures (immutable). The entire structure is as follows.
```
➜  my_midway_app tree
.
├── src
|   ├── app.ts 										 				## EggJS Extended Worker Lifecycle File (optional)
|   ├── agent.ts								   				## EggJS Extended Agent Lifecycle File (Optional)
|   ├── app																## EggJS fixed root directory (optional)
|   │   ├── public		 								  	## The default directory for EggJS static hosting plug-ins (available)
|   │   |   └── reset.css
|   │   ├── view (optional)								## ## The default directory for EggJS template rendering (available)
|   │   |   └── home.tpl
|   │   └── extend (optional)							## EggJS 扩展目录（可配）
|   │       ├── helper.ts (optional)
|   │       ├── request.ts (optional)
|   │       ├── response.ts (optional)
|   │       ├── context.ts (optional)
|   │       ├── application.ts (optional)
|   │       └── agent.ts (optional)
|   │
|   ├── config
|   |   ├── plugin.ts
|   |   ├── config.default.ts
|   │   ├── config.prod.ts
|   |   ├── config.test.ts (可选)
|   |   ├── config.local.ts (可选)
|   |   └── config.unittest.ts (可选)
│   ├── controller								 				## Midway controller directory (recommended)
│   ├── service								     				## Midway service directory (recommended)
│   └── schedule
│
├── typings                        				## EggJS defines the generation directory.
├── test
├── package.json
└── tsconfig.json
```
The above is a complete picture of the directory structure of EggJS, which contains many specific directories of EggJS, some of which have been replaced by corresponding capabilities in the Midway system and can be replaced directly. The entire structure is basically equivalent to moving the directory structure of EggJS to the `src` directory.


Since EggJS is a convention-based framework, the directory structure of the entire project is fixed. Here are some commonly used convention directories.

| `src/app/public/**` | Optional. For more information, see [egg-static](https://github.com/eggjs/egg-static).  |
| --- | --- |
| `src/config/config.{env}.ts` | For more information about how to write a configuration file, see [Configuration](https://eggjs.org/zh-cn/basics/config.html).  |
| `src/config/plugin.js` | For more information, see [Plug-ins](https://eggjs.org/zh-cn/basics/plugin.html).  |
| `test/**` | For more information, see [Unit testing](https://eggjs.org/zh-cn/core/unittest.html).  |
| `src/app.js` and `src/agent.js` | It is used to customize initialization during startup. Optional. For more information, see [Start customization](https://eggjs.org/zh-cn/basics/app-start.html). For more information about the role of `agent.js`, see [Agent mechanism](https://eggjs.org/zh-cn/core/cluster-and-ipc.html#agent-%E6%9C%BA%E5%88% B6).  |



## Configuration Definition


Midway provides the standard TS configuration writing of EggJS in the scaffold. The MidwayConfig includes the definition and attribute tips of the configuration in egg. The structure is as follows.
```typescript
// src/config/config.default.ts
import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_xxxx',
    egg: {
      port: 7001
    },
    // security: {
    //   csrf: false
    // },
  } as MidwayConfig;
};

```
In the form of this return method, it will be automatically executed during the run-time and merged into the complete configuration object.


The parameter of this function is of `MidwayAppConfig` type and the value is the following.

| **appInfo** | **Description** |
| --- | --- |
| pkg | package.json |
| name | Application name, same as pkg.name |
| baseDir | The src (locally developed) or Dist (after online) Directory of the application code |
| appDir | Directory of application code |
| HOME | The user directory, for example, the admin account is/home/admin. |
| root | The root directory of the application is only baseDir in local and unittest environments, and the others are HOME.  |



:::info
Note that the `baseDir` here is different from the `appDir` and EggJS applications.
:::




## Using Egg plugin

Plugin are one of EggJS's features. `@midwayjs/web` also supports EggJS's plug-in system, but in the case of Midway components, Midway components are used as much as possible.


Plug-ins are generally reused by npm modules.
```bash
$ npm i egg-mysql --save
```
Then, you must declare that it is enabled in the `src/config/plugin.js` of the application or framework.


If there is an `export default`, please write it in it.
```typescript
import { EggPlugin } from 'egg';
export default {
  static: false, // default is true
  mysql: {
    enable: true
    package: 'egg-mysql'
  }
} as EggPlugin;

```
If there is no `export default`, you can export it directly.
```typescript
// src/config/plugin.ts
// Use mysql plug-in
export const mysql = {
  enable: true
  package: 'egg-mysql',
};
```


After opening the plug-in, we can use the functions provided by the plug-in in the business code. Generally, the plug-in mounts the object to the `app` and `ctx` of EggJS, and then uses it directly.


```typescript
app.mysql.query(sql, values);			// Methods provided by egg
```
In Midway, you can use `@App` to obtain the `app` object, and in the request scope, you can use `@Inject() ctx` to obtain the `ctx` object, so you can obtain the plug-in object by injection.


```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';
import { Application, Context } from 'egg';

@Provide()
export class HomeController {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
  	This. app.mysql.query (SQL, values); // Call methods on app (if any)
    This. ctx.mysql.query (SQL, values); // Call the method mounted on ctx (if any)
  }
}
```
In addition, you can directly inject plugins mounted by `app` through the `@Plugin` decorator. By default, if no parameters are passed, the property name will be used as the key.


```typescript
import { Provide, Get, Plugin } from '@midwayjs/decorator';

@Provide()
export class HomeController {

  @Plugin()
  mysql: any;

  @Get('/')
  async home() {
  	this.mysql.query( SQL, values);
  }
}
```
:::info
`@Plugin() mysql` is equivalent to `app.mysql`.  The function of `@Plugin` is to take the plug-in corresponding to the attribute name from the app object. Therefore, `@Plugin() xxx` is equal to `app['xxx']`.
:::


## Web middleware


The middleware sample is as follows:


```typescript
import { Middleware } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/web';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      await next();
      console.log(Date.now() - startTime);
    };
  }

}
```

:::caution
Notice

1. If you want to continue to use the traditional functional writing method of EggJS, you must put the file under `src/app/middleware`

2. The built-in middleware that comes with egg has been integrated

:::

Application Middleware.

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as egg from '@midwayjs/web';
import { ReportMiddleware } from './middleware/user.middleware';

@Configuration({
  imports: [egg]
  // ...
})
export class AutoConfiguration {

  @App()
  app: egg.Application;

  async onReady() {
    this.app.useMiddleware(ReportMiddleware);
  }
}

```

For more information, see [Web middleware](../middleware).



## Middleware sequence

Since egg also has its own middleware logic, in the new version, we have done a certain processing of the middleware loading sequence, and the execution sequence is as follows:

- 1. middleware in the egg framework
- 2. the order in which egg plug-ins are added through config.coreMiddleware
- 3. The order in which the business code is configured in config.middleware
- 4. the order in which App. useMiddleware is added

Because midway's middleware will be post-loaded, we can customize sorting in the onReady.



## BodyParser

the `bodyParser` feature of the egg. by default, it parses `post` requests and automatically identifies the `json` and `form` types.

If you need text or xml, you can configure it yourself.

The default size is limited to `1mb`. You can set the size of each item separately.

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    xmlLimit: '1mb',
  },
}
```

Note that the type selection when using Postman for Post requests:

![postman](https://img.alicdn.com/imgextra/i4/O1CN01QCdTsN1S347SuzZU5_!!6000000002190-2-tps-1017-690.png)




## Timed task
For more information about the start of v3, see [task components](./extesion/task).

To be compatible with the previous [egg scheduled tasks](https://eggjs.org/zh-cn/basics/schedule.html), follow the following steps.

First install `midway-schedule` dependencies.

```bash
$ npm i midway-schedule --save
```

Add to the plug-in.

```typescript
// src/config/plugin.ts
export default {
  schedule: true
  schedulePlus: {
    enable: true
    package: midway-schedule
  }
}
```

Please refer to the previous version of the document.



## Log

Since v3 cannot use egg-logger, see [Logs](../logger).



## Exception handling

EggJS framework provides a unified error handling mechanism through [onerror](https://github.com/eggjs/egg-onerror) plug-ins, which will be used as Midway's bottom error logic and will not conflict with [error filters](../error_filter).

Any exception thrown in all processing methods (Middleware, Controller, Service) for a request will be captured by it and will automatically return different types of errors (based on [Content Negotiation](https://tools.ietf.org/html/rfc7231#section-5.3.2)) according to the type the request wants to obtain.



| Format of request requirements | Environment | errorPageUrl whether to configure | Return content |
| --- | --- | --- | --- |
| HTML & TEXT | local & unittest | - | Onerror comes with an error page that displays detailed error information |
| HTML & TEXT | Other | Yes | Redirect to errorPageUrl |
| HTML & TEXT | Other | No | onerror comes with a simple error page without error information (not recommended) |
| JSON & JSONP | local & unittest | - | JSON object or corresponding JSONP format response with detailed error information |
| JSON & JSONP | Other | - | JSON object or corresponding JSONP format response, without detailed error information |




errorPageUrl attribute is supported in the configuration of the onerror plug-in. When the errorPageUrl is configured, once the user requests an exception to the HTML page applied online, it will be redirected to this address.


In `src/config/config.default.ts`
```typescript
// src/config/config.default.ts
module.exports = {
  onerror: {
    // When an exception occurs on the online page, redirect to this page
    errorPageUrl: '/50x.html',
  },
};
```



## Extended Application/Context/Request/Response


### Add extension logic


Although MidwayJS do not want to mount the attribute directly to koa's Context and App (which will cause uncertainty in management and definition), this function of EggJS is still available.


The file location is as follows.
```
➜  my_midway_app tree
.
├── src
│   ├── app
│   │   └── extend
│   │       ├── application.ts
│   │       ├── context.ts
│   │       ├── request.ts
│   │       └── response.ts
│   ├── config
│   └── interface.ts
├── test
├── package.json
└── tsconfig.json
```
The content is the same as the original EggJS.
```typescript
// src/app/extend/context.ts
export default {
  get hello() {
    return 'hello world';
  },
};
```
### Add extended definition

Context please use Midway to extend, please check the [extended context definition](https://midwayjs.org/docs/context_definition).


For the rest, please expand in `src/interface.ts`.
```typescript
// src/interface.ts
declare module 'egg '{
  interface Request {
    // ...
  }
  interface Response {
    // ...
  }
  interface Application {
    // ...
  }
}
```
:::info
**Do not place the definition of business custom extensions under the root directory** to avoid overwriting by ts-helper tools.``
:::



## Use egg-scripts deployment

Since EggJS provides the default multi-process deployment tool `egg-scripts`, Midway also continues to support this method. If the upper layer is EggJS, this deployment method is recommended.

First, in the dependency, ensure that the `egg-scripts` package is installed.

```bash
$ npm i egg-scripts --save
```



Add `npm scripts` to `package.json`:

After the above code is built, use our `start` and `stop` commands to start and stop.

```json
"scripts": {
    "start": "egg-scripts start --daemon --title=********* --framework=@midwayjs/web",
    "stop": "egg-scripts stop --title=*********",
}
```



:::info

`*********` is your project name.
:::

> Note: `egg-scripts` has limited support for Windows systems, see [#22](https://github.com/eggjs/egg-scripts/pull/22).

####

**Start Parameters**

```bash
$ egg-scripts start --port=7001 --daemon --title=egg-server-showcase
```

Copy

As shown in the above example, the following parameters are supported:

- ``--port=7001` Port number, the environment variable process.env.PORT will be read by default, if not passed, the framework's built-in port 7001 will be used.`
- Whether `-- daemon` is allowed in the background mode without nohup. If Docker is used, it is recommended to run directly at the foreground.
- `-- env = prod` running environment of the framework. By default, the environment variable process.env.EGG_SERVER_ENV will be read. If it is not passed, the built-in environment prod of the framework will be used.
- `-- workers = 2` Number of Worker threads in the framework. By default, the number of app workers equivalent to the number of CPU cores will be created, which can make full use of CPU resources.
- `-- title = egg-server-showcase` is used to facilitate grep in ps processes. the default value is egg-server-${appname}.
- `-- framework = yadan` If the application uses a [custom framework](https://eggjs.org/zh-cn/advanced/framework.html), you can configure the egg.framework of the package.json or specify this parameter.
- `-- ignore-stderr`.
- `-- https.key` specifies the full path of the key file that is required for HTTPS.
- `-- https.cert` specifies the full path of the certificate file required for HTTPS.
- All [egg-cluster](https://github.com/eggjs/egg-cluster) Options support transparent transmission, such as -- port, etc.

For more parameters, see the [egg-scripts](https://github.com/eggjs/egg-scripts) and [egg-cluster](https://github.com/eggjs/egg-cluster) documents.

:::info

Logs deployed using egg-scripts are stored in the **user directory** **,** such as `/home/xxxx/logs`.

:::



## Startup environment

The original egg uses `EGG_SERVER_ENV` as an environmental sign, please use `MIDWAY_SERVER_ENV` in Midway.



## Configuration

### Default configuration

```typescript
// src/config/config.default
export default {
  // ...
  egg: {
    port: 7001
  },
}
```

All parameters of `@midwayjs/web` are as follows:

| Configuration Item | Type | Description |
| -------------- | ---------------- | ---------------------------- |
| port | number | Required, Started Port |
| key | string | Buffer |
| cert | string | Buffer |
| ca | string | Buffer |
| hostname | string | The hostname of the listener, the default 127.1 |
| http2 | boolean | Optional, supported by http2, default false |
| queryParseMode | simple\|extended | The default is extended |

The above attributes are valid for applications deployed locally and using `bootstrap.js`.



### Modify port

:::tip

Note that this method will only take effect for projects developed locally and deployed using bootstrap.js files.

:::

By default, we provide the `7001` default port parameter in `config.default`. by modifying it, we can modify the default port of egg http service.

For example, we changed it to `6001`:

```typescript
// src/config/config.default
export default {
  // ...
  egg: {
    port: 6001
  },
}
```

By default, our port configuration is `null` because the single-test environment requires supertest to start the port.

```typescript
// src/config/config.unittest
export default {
  // ...
  egg: {
    port: null
  },
}
```

In addition, you can also temporarily modify the port by `midway-bin dev-ts-port = 6001`, which overwrites the configured port.



### Global prefix

For more information about this feature, see [Global Prefixes](../controller# Global Routing Prefix).



### Https configuration

In most cases, please use external agents as much as possible to complete the implementation of Https, such as Nginx.

In some special scenarios, you can directly turn on Https by configuring SSL certificates (TLS certificates).

First, you must prepare certificate files in advance, such as `ssl.key` and `ssl.pem`. The key is the private key of the server and the pem is the corresponding certificate.

Then configure it.

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  egg: {
    key: join(__dirname, '../ssl/ssl.key')
    cert: join(__dirname, '../ssl/ssl.pem')
  },
}
```



### favicon settings

By default, the browser will initiate a request to `favicon.ico`.

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  siteFile: {
    '/favicon.ico': readFileSync(join(__dirname, 'favicon.png'))
  },
}
```



If the `@midwayjs/static-file` component is turned on, static file hosting of the component will be preferred.

### Modify context log

The context log of the egg framework can be modified individually.

```typescript
export default {
  egg: {
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      return '${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}';
    }
    // ...
  },
};
```



### Query array parsing

By default, `ctx.query` parses to ignore arrays, while `ctx.queries` strictly turns all fields into arrays.

If you adjust the `queryParseMode`, you can make `ctx.query` a structure between the two (the result of the querystring).

```typescript
// src/config/config.default
export default {
  // ...
  egg: {
    // ...
    queryParseMode: 'simple',
  },
}
```




## Common problem
### 1. generate ts definition


Midway provides the `@midwayjs/egg-ts-Hepler` toolkit for quickly generating the definitions that EggJS depends on when developing.
```bash
$ npm install @midwayjs/egg-ts-helper --save-dev
```
Add the corresponding `ets` command to `package.json`. Generally speaking, we will add it before the dev command to ensure the correctness of the code.
```json
  "scripts": {
    "dev": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts ",
  },
```
:::info
Before writing code for the first time, you need to execute this command once to have ts definition generation.
:::


EggJS-generated definitions are in the `typings` directory.
```
➜  my_midway_app tree
.
├── src                            ## midway project source code
├── typings                        ## EggJS defines the generation directory.
├── test
├── package.json
└── tsconfig.json
```


### 2. Special Situation of Configuration in EggJS


Under EggJS, the life cycle in `configuration.ts` **will only be loaded and executed** under worker. If you have similar requirements on the Agent, use the `agent.ts` of EggJS.



### 3. Asynchronous initialization configuration cannot override plug-in configuration

`onConfigLoad` the lifecycle is executed after the egg plug-in (if any) is initialized, it cannot be used to override the configuration used by the egg plug-in.



### 4. default csrf error


In the post request, especially the first time, the user will find a csrf error. the reason is that [egg-security](https://github.com/eggjs/egg-security) is built into the security plug-in in the framework by default, and csrf verification is enabled by default.


We can turn it off in the config, but better to go to [**Learn about it**](https://eggjs.org/en-us/core/security.html#%E5%AE%89%E5%85%A8%E5%A8%81%E8%83%81-csrf-%E7%9A%84%E9%98%B2%E8%8C%83) and then make a selection.

```typescript
export const security = {
  csrf: false
};
```




### 5. There is no definition problem

Some egg plug-ins do not provide ts definitions, resulting in undeclared methods, such as egg-mysql.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01mv68zG1zN6nALff8n_!!6000000006701-2-tps-1478-876.png)
You can use any to bypass.

```typescript
await (this.app as any).mysql.query(sql);
```

Or you can add extended definitions by yourself.

