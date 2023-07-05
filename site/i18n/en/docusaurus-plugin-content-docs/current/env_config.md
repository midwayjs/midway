# Multi-environment configuration

Configuration is a common function, and different configuration information is often used in different environments.


In this article, we will introduce how Midway loads business configurations for different environments.



## Business profile


The framework provides extensible configuration functions, which can automatically merge the configurations of applications, frameworks, and components, and can maintain different configurations according to the environment.


You can customize the directory and put the configuration files of multiple environments in it. For example, the following common directory structures are used. For more information about the specific environment, see [Running environment](environment).
```
➜  my_midway_app tree
.
├── src
│   ├── config
│   │   ├── config.default.ts
│   │   ├── config.prod.ts
│   │   ├── config.unittest.ts
│   │   └── config.local.ts
│   ├── interface.ts
│   └── service
├── test
├── package.json
└── tsconfig.json
```

`Config. default.ts` is the default configuration file. All environments will load this configuration file and will generally be used as the default configuration file for the development environment.


The configuration is not **required**. You must add the required environment.



## Load business configuration


Then we can configure this file (directory) in `src/configuration.ts`, and the framework will know to load it.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
  ]
})
export class MainConfiguration {
}
```

Below we will introduce two ways to load the configuration.



### 1. Object form loading

Starting from Midway v3, we will introduce the standard object loading method as the configuration of the main push.

In some scenarios, such as single-file construction and other requirements that are not related to the directory structure, only this standard module loading method is supported to load the configuration.

The configuration files of each environment **must be explicitly specified and added**. Subsequent frames are merged based on the actual environment.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  importConfigs: [
    {
      default: DefaultConfig
      local: LocalConfig
    }
  ]
})
export class MainConfiguration {
}
```
The array in the `importConfigs` passes configuration objects. The key of each object is the environment, and the value is the configuration value corresponding to the environment. midway loads the corresponding configuration according to the environment during startup.



### 2. Specify directory or file loading


Specifies that a directory is loaded. All `config.*.ts` in the directory are scanned and loaded.


:::info
`importConfigs` here, only the files to be loaded are specified. In actual runtime, the current environment** will be **automatically selected to find the corresponding file suffix.
:::


The rules for the configuration file are:


- 1. You can specify a directory, the traditional `src/config` directory is recommended, or you can specify a file
- 2. file designation does not require TS suffix
- 3. The configuration file **must be explicitly specified and added**.



**Example: Specify a directory**

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class MainConfiguration {
}
```


**Example: Specify a specific file**


When you manually specify a batch of files, an error will be reported if the file does not exist at this time.


```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/config.default'),
    join(__dirname, './config/config.local'),
    join(__dirname, './config/custom.local')		// You can use custom naming, as long as the middle part has an environment
  ]
})
export class MainConfiguration {
}
```


You can also use configurations outside the project, but use the absolute path and the `*.js` suffix.


For example, the directory structure is as follows (note the `customConfig.default.js` file):

```
 base-app
 ├── package.json
 ├── customConfig.default.js
 └── src
     ├── configuration.ts
     └── config
         └── config.default.ts
```

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
    join(__dirname, '../customConfig.default')
  ]
})
export class MainConfiguration {
}
```



## Configuration format

Midway provides a `MidwayConfig` definition. Whenever a component is turned on (`imports` in `configuration.ts` ), the `MidwayConfig` will automatically include the configuration definition of the component.

Configurations can be exported in two formats.

:::tip

Through our practice, exporting objects will be simpler and more friendly, and many wrong usages can be avoided.

The configuration of the components will be documented in this format.

:::




### 1. Object Form


The configuration file format is object, for example:

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: '1639994056460_8009',
  koa: {
    port: 7001,
  },
} as MidwayConfig;
```



### 2. Function form


The configuration file is a function with `appInfo` parameters. In the form of this return method, it will be automatically executed during the runtime, merging the return values into the complete configuration object.

```typescript
// src/config/config.default.ts
import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  return {
    keys: '1639994056460_8009',
    koa: {
      port: 7001
    },
    view: {
      root: path.join(appInfo.appDir, 'view')
    },
  };
}

```

The parameter of this function is of `MidwayAppInfo` type and the value is the following.


| **appInfo** | **Description** |
| ----------- | ------------------------------------------------------------ |
| pkg | package.json |
| name | Application name, same as pkg.name |
| baseDir | The src (locally developed) or dist (after online) directory of the application code |
| appDir | Directory of application code |
| HOME | The user directory, for example, the admin account is/home/admin. |
| root | The root directory of the application is only baseDir in local and unittest environments, and the others are HOME.  |



## Configuration definition

Midway provides `MidwayConfig` as a unified configuration item definition, and all components merge the definition into this configuration item definition.

To do this, please use the format recommended by the document as much as possible to achieve the best effect.

Whenever a new component is enabled, the configuration definition will automatically add the configuration items of the component. Through this behavior, you can also check whether a component is enabled in disguise.

For example, we have enabled the effect of the view component.

![](https://img.alicdn.com/imgextra/i2/O1CN013sHGlA1o3uQ4Pg0nO_!!6000000005170-2-tps-1416-572.png)

:::tip

Why not use the normal key export form and use the object?

1. If the user does not understand the configuration items, he still needs to check the document to understand the meaning of each item. Except that the first layer has a certain prompt function, the later level prompts have no obvious efficiency improvement.

2. The form of key export has no advantage in the deep structure.

3. Key export may be duplicated, but there will be no warning or error at the code level, which is difficult to troubleshoot. This object form is relatively friendly.

:::



## Configure load order


There is a priority in the configuration (application code> component), and the priority will be higher relative to this operating environment.


For example, the loading sequence of a configuration in the prod environment is as follows, and the subsequent loading will overwrite the previous configuration with the same name.


```typescript
-> component config.default.ts
-> apply config.default.ts
-> component config.prod.ts
-> apply config.prod.ts
```



## Configure merge rules


By default, the `**/config.defaut.ts` file and the `**/config.{environment}.ts` file are loaded.


For example, the following code will find the `config.default.*` and `config.local.*` files in the `local` environment. If the file is in other environments, only `config.default.*` and `config.{current environment}.*` will be found. If the file does not exist, it will not be loaded or an error will be reported.
```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class MainConfiguration {
}
```


In order to be forward compatible, we have done some processing on configuration reading for some special environments. The value of the environment here refers to the [result](environment#AxjGQ) obtained from the combination of `NODE_ENV` and `MIDWAY_SERVER_ENV` values.

| **Environment Value** | **Read configuration file** |
| --- | --- |
| prod | *.default.ts + *.prod.ts |
| production | *.default.ts + *.production.ts + *.prod.ts |
| unittest | *.default.ts + *.unittest.ts |
| test | *.default.ts + *.test.ts + *.unittest.ts |

Except for the above table, the rest are values of `*.default.ts + *.{current environment}.ts`.


In addition, the configured merge uses the [extend2](https://github.com/eggjs/extend2) module for deep copy, [extend2](https://github.com/eggjs/extend2) fork from [extend](https://github.com/justmoon/node-extend), and there will be differences in array processing.

```javascript
const a = {
  arr: [ 1, 2 ],
};
const b = {
  arr: [ 3 ],
};
extend(true, a, b);
// => { arr: [ 3 ] }
```
According to the above example, the framework directly covers the array instead of merging.



## Get configuration


Midway saves all the configurations in the internal configuration service. The entire structure is an object. When using the Midway service code, use the `@Config` decorator to inject the configuration.



### Single configuration value


By default, it is obtained from the configuration object based on the string parameter value of the decorator.


```typescript
import { Config } from '@midwayjs/core';

export class IndexHandler {

  @Config('userService')
  userConfig;

  async handler() {
  	console.log(this.userConfig);  // { appname: 'test'}
  }
}
```



### Deep level configuration value


If the value of the configuration object is deep in the object, it can be obtained in Cascade.


For example, the data source is:


```json
{
  "userService": {
  	"appname": {
      "test": {
      	"data": "xxx"
      }
    }
  }
}
```
You can write complex fetch expressions to fetch values, as shown in the following example.
```typescript
import { Config } from '@midwayjs/core';

export class IndexHandler {

  @Config('userService.appname.test.data')
  data;

  async handler() {
  	console.log(this.data);  // xxx
  }
}
```



### The entire configuration object


You can also use the `ALL` attribute to obtain the entire configured object.
```typescript
import { Config, ALL } from '@midwayjs/core';

export class IndexHandler {

  @Config(ALL)
  allConfig;

  async handler() {
  	console.log(this.allConfig);  // { userService: { appname: 'test'}}
  }
}
```



## Modify configuration

In the coding process, we have some places that can dynamically modify the configuration for different scenarios.



### Modification in Life Cycle


midway adds an asynchronous configuration loading lifecycle that can be executed after the configuration is loaded.

```typescript
// src/configuration.ts
import { Configuration, IMidwayContainer, IMidwayContainer } from '@midwayjs/core';
import { join } from 'path';
import { RemoteConfigService } from '../service/remote'; // Custom Get Remote Configuration Service

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
  ]
})
export class MainConfiguration {

  async onConfigLoad(container: IMidwayContainer) {
    // Here you can modify the global configuration
  	const remoteConfigService = await container.getAsync(RemoteConfigService);
    const remoteConfig = await remoteConfigService.getData();

    // The return value here will be merged with the global config
    // const remoteConfig = {
    //   typeorm: {
    //     dataSource: {
    //       default: {
    //         type: "mysql",
    //         host: "localhost",
    //         port: 3306,
    //         username: "root",
    //         password: "123456",
    //         database: "admin",
    //         synchronize: false,
    //         logging: false,
    //         entities: "/**/**.entity.ts",
    //         dateStrings: true
    //       }
    //     }
    //   }
    // }
    return remoteConfig;
  }
}
```

Note that the `onConfigLoad` lifecycle is executed after the egg plug-in (if any) is initialized, so it cannot be used to override the configuration used by the egg plug-in.



### Add configuration in bootstrap

You can add configuration before starting the code.

```typescript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap
  .configure({
  	globalConfig: {
      default: {
        keys: 'abcde',
        koa: {
          port: 7001
        }
      },
      unittest: {
        koa: {
          port: null
        }
      }
    }
  })
  .run();
```

`configure` method can pass a `globalConfig` attribute, and can pass a global configuration before the application starts. The structure is consistent with the configuration of the object form to distinguish the environment.



### Use API to add configuration


You can use the [API](./built_in_service#midwayconfigservice) provided by midway to modify the configuration in other scenarios.



## Use environmental variables


The community has some libraries, such as `dotenv`, which can load `.env` files and inject them into the environment, so as to put some keys in the environment, which can be directly used in Midway.
```bash
$ npm i dotenv --save
```
We can initialize in entry points like `bootstrap.js` or `configuration` .
```
OSS_SECRET = 12345
OSS_ACCESSKEY = 54321
```
We can initialize in the portal, such as `bootstrap.js` or `configuration`.
```typescript
import { Configuration } from '@midwayjs/core';
import * as dotenv from 'dotenv';

// load .env file in process.cwd
dotenv.config();

@Configuration({
  //...
})
export class MainConfiguration {
  async onReady(container) {

  }
}

```


We can use it in the environment configuration.
```typescript
// src/config/config.default

export const oss = {
  accessKey: process.env.OSS_ACCESSKEY, // 54321
  secret: process.env.OSS_SECRET // 12345
}
```



## Common errors


There are many possibilities that the configuration does not take effect, and the troubleshooting ideas are as follows:

- 1. Check whether `importConfigs` related files or directories are explicitly configured in the configuration file
- 2. Check whether the environment in which the application is started is consistent with the configuration file. For example, the configuration of prod will definitely not appear in local
- 3. Check whether ordinary export and method callback export are mixed, such as the following mixed use



### 1. Get the value injected by @Config in the constructor (constructor)


**Please do not get the attribute injected by `@Config()` in the constructor**, which will make the result undefined. The reason is that the properties injected by the decorator are assigned only after the instance is created (new). In this case, use the `@Init` decorator.

```typescript
@Provide()
export class UserService {

  @Config('redisConfig')
  redisConfig;

  constructor() {
  	console.log(this.redisConfig); // undefined
  }

  @Init()
  async initMethod() {
  	console.log(this.redisConfig); // has value
  }

}
```



### 2. Mixed use of callback and export writing

**The following is the wrong usage.**

```typescript
export default (appInfo) => {
  const config = {};

  // xxx
  return config;
};

export const keys = '12345';
```

The value defined by `export const` is ignored.



### 3. mix export default and export const

**The following is the wrong usage.**

```typescript
export default {
  keys: '12345',
}

export const anotherKey = '54321';
```
The following configuration will be ignored.

### 4. export = mixed with other

If the `export =` parameter is mixed, the value of the `export =` parameter is ignored.

```typescript
export = {
  a: 1
}
export const b = 2;
```

Compiled results:

```typescript
export const b = 2;
```

