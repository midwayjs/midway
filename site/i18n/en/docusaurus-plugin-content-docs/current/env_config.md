# Multi-environment configuration

Configuration is a commonly used function, and different configuration information is often used in different environments.

In this article, we will introduce how Midway loads business configurations for different environments.



## Configuration file

The simplest is to use the business configuration file capabilities provided by the framework.

This capability is available across all business code and components throughout the Midway lifecycle.

Configuration files can be exported in two formats, **object form** and **function form**.

:::tip

After our practice, **object form** will be simpler and more friendly, and can avoid many wrong usages.

We will display it in this form in most documents.

:::



### Configuration file directory

We can customize a directory and put the configuration file in it.

For example, the `src/config` directory.

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

There are some specific conventions for configuration file names.

`config.default.ts` is the default configuration file, and all environments will load this configuration file.

For the rest of the file names, use `config.environment` as the file name. For the concept of specific environment, please see [Running Environment](environment).

Configuration is not **required**, please add the environment configuration you need as appropriate.




### Object form


The configuration file export format is object, for example:

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



### Function form


The configuration file is a function with `appInfo` parameters. This function will be automatically executed when the framework is initialized, and the return value will be merged into the complete configuration object.

```typescript
// src/config/config.default.ts
import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
   return {
     keys: '1639994056460_8009',
     koa: {
       port: 7001,
     },
     view: {
       root: path.join(appInfo.appDir, 'view'),
     },
   };
}

```

The parameter of this function is `MidwayAppInfo` type, and the value is as follows.


| **appInfo** | **Description**                                              |
| ----------- | ------------------------------------------------------------ |
| pkg         | package.json                                                 |
| name        | application name, same as pkg.name                           |
| baseDir     | src (local development) or dist (online) directory of the application code |
| appDir      | directory for application code                               |
| HOME        | user directory, such as /home/admin for the admin account    |
| root        | Application root directory, baseDir only in local and unittest environments, and HOME in others. |



### Configuration file definition

Midway provides `MidwayConfig` as a unified configuration item definition, and all components will merge their definitions into this configuration item definition. Whenever a component is enabled (`imports` in `configuration.ts`), `MidwayConfig` will automatically include the configuration definition for that component.

For this reason, please use the format recommended by the documentation as much as possible to achieve the best usage effect.

Whenever a new component is enabled, the configuration definition will automatically add the configuration items of the component. Through this behavior, you can also check whether a certain component is enabled in disguise.

For example, we enable the effect of the view component.

![](https://img.alicdn.com/imgextra/i2/O1CN013sHGlA1o3uQ4Pg0nO_!!6000000005170-2-tps-1416-572.png)

:::tip

Why use objects instead of plain key exports?

1. If the user does not understand the configuration items, he still needs to check the document to understand the meaning of each item. Except for the first level of prompts, the subsequent levels of prompts do not have obvious efficiency improvements.

2. The form of key export has no advantage in displaying under an overly deep structure

3. The key export may be repeated, but there will be no warnings or errors at the code level, which is difficult to troubleshoot. The object form is more friendly

:::



### Load configuration file in object form


The framework provides the function of loading configuration files for different environments, which needs to be enabled in the `src/configuration.ts` file.


There are two ways to load configuration, **object format** and **specified directory format** loading.

Starting from Midway v3, we will use **object form** as the main configuration loading form.

In scenarios such as single-file construction and ESM, only this standard module loading method is supported to load configurations.

The configuration file of each environment **must explicitly specify to add**, and subsequent frameworks will be merged according to the actual environment.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';

import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
   importConfigs: [
     {
       default: DefaultConfig,
       local: LocalConfig
     }
   ]
})
export class MainConfiguration {
}
```

Configuration objects are passed in the array in `importConfigs`. The key of each object is the environment, and the value is the configuration value corresponding to the environment. Midway will load the corresponding configuration according to the environment during startup.



### Specify directory and file loading configuration

Specify a directory to load, and all `config.*.ts` in the directory will be scanned and loaded.

ESM, single-file deployment, etc. do not support directory configuration loading.

:::info
`importConfigs` here just specify the files that need to be loaded, and the actual runtime will **automatically select the current environment** to find the corresponding file suffix.
:::


The rules for the configuration file are:


- 1. You can specify a directory, the traditional `src/config` directory is recommended, or you can specify a file
- 2. The file specification does not require the ts suffix
- 3. Configuration file **Must be explicitly specified to add**



**Example: specify directory**

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


**Example: specifying a specific file**


When manually specifying a batch of files, if the files do not exist at this time, an error will be reported.


```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
   importConfigs: [
     join(__dirname, './config/config.default'),
     join(__dirname, './config/config.local'),
     join(__dirname, './config/custom.local') // You can use custom naming, as long as the middle part has an environment
   ]
})
export class MainConfiguration {
}
```


You can also use the configuration outside the project, but please use the absolute path and `*.js` suffix.


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
     join(__dirname, './config/'),
     join(__dirname, '../customConfig.default'),
   ]
})
export class MainConfiguration {
}
```





### Configure loading order


There is a priority for configuration (Application Code > Component), and the priority will be higher relative to this running environment.


For example, the loading sequence for loading a configuration in the prod environment is as follows. The later loaded configuration will overwrite the previous configuration with the same name.


```typescript
-> Component config.default.ts
-> Apply config.default.ts
-> component config.prod.ts
-> apply config.prod.ts
```



### Configure merge rules


By default, the `**/config.defaut.ts` file and the `**/config.{environment}.ts` file will be loaded.

For example, the following code will search for `config.default.*` and `config.local.*` files in the `local` environment. If it is in other environments, it will only search for `config.default.*` and `config.{Current environment}.*`, if the file does not exist, it will not be loaded and no error will be reported.

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


For forward compatibility, we have done some processing on the configuration reading of some special environments. The value of the environment here refers to the [result](environment#AxjGQ) based on the values of `NODE_ENV` and `MIDWAY_SERVER_ENV`.

| **Environment value** | **Configuration file read**                |
| --------------------- | ------------------------------------------ |
| prod                  | *.default.ts + *.prod.ts                   |
| production            | *.default.ts + *.production.ts + *.prod.ts |
| unittest              | *.default.ts + *.unittest.ts               |
| test                  | *.default.ts + *.test.ts + *.unittest.ts   |

Except for the above table, the rest are the values of `*.default.ts + *.{current environment}.ts`.


In addition, the configuration is merged using the [extend2](https://github.com/eggjs/extend2) module for deep copying, and the [extend2](https://github.com/eggjs/extend2) fork from [extend](https ://github.com/justmoon/node-extend), there will be differences when handling arrays.

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

According to the example above, the framework directly overwrites the array instead of doing the merge.



## get configuration


Midway will save the configuration in the internal configuration service. The entire structure is an object, which is injected using the `@Config` decorator when used by Midway business code.



### Single configuration value


By default, it will be obtained from the configuration object according to the string parameter value of the decorator.


```typescript
import { Config } from '@midwayjs/core';

export class IndexHandler {

   @Config('userService')
   userConfig;

   async handler() {
   console.log(this.userConfig); // { appname: 'test'}
   }
}
```



### Deep level configuration values


If the value of the configuration object is deep in the object, it can be obtained in a cascaded manner.


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

You can write complex acquisition expressions to acquire values, examples are as follows.

```typescript
import { Config } from '@midwayjs/core';

export class IndexHandler {

   @Config('userService.appname.test.data')
   data;

   async handler() {
   console.log(this.data); // xxx
   }
}

```



### The entire configuration object


You can also get the entire configuration object through the special attribute `ALL`.

```typescript
import { Config, ALL } from '@midwayjs/core';

export class IndexHandler {

   @Config(ALL)
   allConfig;

   async handler() {
   console.log(this.allConfig); // { userService: { appname: 'test'}}
   }
}
```



## Change setting

During the coding process, we have some places where the configuration can be dynamically modified for use in different scenarios.



### Modification during life cycle


midway has added an asynchronous configuration loading life cycle, which can be executed after the configuration is loaded.

```typescript
// src/configuration.ts
import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { join } from 'path';
import { RemoteConfigService } from '../service/remote'; // Customized access to remote configuration service

@Configuration({
   importConfigs: [
     join(__dirname, './config/'),
   ]
})
export class MainConfiguration {
  
  async onConfigLoad(container: IMidwayContainer) {
    // Here you can modify the global configuration
    const remoteConfigService = await container. getAsync(RemoteConfigService);
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

:::caution

The `onConfigLoad` lifecycle is executed after the egg plugin (if any) is initialized and cannot be used to override the configuration of the egg plugin.

:::



### Modify at startup

You can add configuration using Bootstrap's `configure` method before starting the code.

The `configure` method can pass a `globalConfig` attribute, which can pass a global configuration before the application starts.

If you pass an array, you can differentiate between environments.

```typescript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap
  .configure({
    globalConfig: [
      {
        default: {
          abc: '123'
        },
        unittest: {
          abc: '321'
        }
      }
    ]
  })
  .run();

// in unittest, app.getConfig('abc') => '321'
```

If an object is passed, it is overridden directly.

```typescript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap
  .configure({
    globalConfig: {
      abc: 'text'
    }
  })
  .run();

// app.getConfig('abc') => 'text'
```



### Modify using API


To modify the configuration in other scenarios, you can use the [API](./built_in_service#midwayconfigservice) provided by midway.



## Environment variables and configuration


There are some libraries in the community, such as `dotenv`, which can load `.env` files and inject them into the environment, thereby placing some keys in the environment, which can be directly relied on in Midway.

```bash
$ npm i dotenv --save
```

You can add a `.env` file in the project root directory, such as the following:

```
OSS_SECRET=12345
OSS_ACCESSKEY=54321
```

We can initialize it in the entry, such as `bootstrap.js` or `configuration`.

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



## Common mistakes


There are many possibilities for the configuration not taking effect. The troubleshooting ideas are as follows:

- 1. Check whether the files or directories related to `importConfigs` are explicitly configured in the configuration file.
- 2. Check whether the application startup environment is consistent with the configuration file. For example, the prod configuration will definitely not appear in local.
- 3. Check whether ordinary export and method callback export are mixed use, such as the following mixed use situation



### 1. Obtain the value injected by @Config in the constructor

**Please don’t **get the properties injected by `@Config()` in the constructor, which will make the result undefined. The reason is that the attributes injected by the decorator will not be assigned until the instance is created (new). In this case, use the `@Init` decorator.

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



### 2. Mix callback and export writing methods

**The following is incorrect usage. **

```typescript
export default (appInfo) => {
   const config = {};

   // xxx
   return config;
};

export const keys = '12345';
```

Values defined with `export const` are ignored.



### 3. Mix export default and export const

**The following is incorrect usage. **

```typescript
export default {
   keys: '12345',
}

export const anotherKey = '54321';
```

Configurations located later will be ignored.

### 4. Export= mixed with others

When `export=` is mixed, if there are other configurations later, the value of `export=` will be ignored.

```typescript
export = {
   a: 1
}
export const b = 2;
```

Compiled result:

```typescript
export const b = 2;
```
