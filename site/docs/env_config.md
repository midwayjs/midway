# 多环境配置

配置是我们常用的功能，而且在不同的环境，经常会使用不同的配置信息。


本篇我们来介绍 Midway 如何加载不同环境的业务配置。



## 业务配置文件


框架提供了可扩展的配置功能，可以自动合并应用、框架、组件的配置，且可以根据环境维护不同的配置。


我们可以自定义目录，在其中放入多个环境的配置文件，如下列常见的目录结构，具体环境的概念请查看 [运行环境](environment)。
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

`config.default.ts` 为默认的配置文件，所有环境都会加载这个配置文件，一般也会作为开发环境的默认配置文件。


配置不是 **必选项**，请酌情添加自己需要的环境配置。



## 加载业务配置


然后我们可以在 `src/configuration.ts` 中配置这个文件（目录），框架就知道加载它了。

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

下面我们将介绍加载配置的两种方式。



### 1、对象形式加载

从 Midway v3 开始，我们将以标准的对象加载方式作为主推的配置引入形式。

在一些场景下，比如单文件构建等和目录结构无关的需求，只支持这种标准的模块加载方式来加载配置。

每个环境的配置文件 **必须显式指定添加**，后续框架会根据实际的环境进行合并。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

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
`importConfigs` 中的数组中传递配置对象，每个对象的 key 为环境，值为环境对应的配置值，midway 在启动中会根据环境来加载对应的配置。



### 2、指定目录或者文件加载


指定加载一个目录，目录里所有的 `config.*.ts` 都会被扫描加载。


:::info
`importConfigs`  这里只是指定需要加载的文件，实际运行时会**自动选择当前的环境**来找对应的文件后缀。
:::


配置文件的规则为：


- 1、可以指定一个目录，推荐传统的 `src/config`  目录，也可以指定一个文件
- 2、文件指定无需 ts 后缀
- 3、配置文件 **必须显式指定添加**



**示例：指定目录**

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


**示例：指定特定文件**


手动指定一批文件时，这个时候如果文件不存在，则会报错。


```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/config.default'),
    join(__dirname, './config/config.local'),
    join(__dirname, './config/custom.local')		// 可以使用自定义的命名，只要中间部分带环境就行
  ]
})
export class MainConfiguration {
}
```


也可以使用项目外的配置，但是请使用绝对路径，以及 `*.js`  后缀。


比如目录结构如下（注意 `customConfig.default.js` 文件）：

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



## 配置格式

Midway 提供了 `MidwayConfig` 定义，每当一个组件被开启（在 `configuration.ts` 中被 `imports` ），`MidwayConfig` 就会自动包含该组件的配置定义。

配置可以以两种格式导出。

:::tip

经过我们的实践，以对象导出会更加的简单友好，可以规避许多错误用法。

组件的配置我们都将以此格式编写文档。

:::




### 1、对象形式


配置文件格式为 object，比如：

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



### 2、函数形式


配置文件为一个带有 `appInfo` 参数的函数。通过这样返回方法的形式，在运行期会被自动执行，将返回值合并进完整的配置对象。

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

这个函数的参数为 `MidwayAppInfo` 类型，值为以下内容。


| **appInfo** | **说明**                                                     |
| ----------- | ------------------------------------------------------------ |
| pkg         | package.json                                                 |
| name        | 应用名，同 pkg.name                                          |
| baseDir     | 应用代码的 src （本地开发）或者 dist （上线后）目录          |
| appDir      | 应用代码的目录                                               |
| HOME        | 用户目录，如 admin 账户为 /home/admin                        |
| root        | 应用根目录，只有在 local 和 unittest 环境下为 baseDir，其他都为 HOME。 |



## 配置定义

Midway 提供了 `MidwayConfig` 作为统一的配置项定义，所有的组件都会将定义合并到此配置项定义中。

为此，请尽可能使用文档推荐的格式，以达到最佳的使用效果。

每当启用一个新组件时，配置定义都会自动加入该组件的配置项，通过这个行为，也可以变相的检查是否启用了某个组件。

比如，我们启用了 view 组件的效果。

![](https://img.alicdn.com/imgextra/i2/O1CN013sHGlA1o3uQ4Pg0nO_!!6000000005170-2-tps-1416-572.png)

:::tip

为什么不使用普通 key 导出形式而使用对象？

1、用户在不了解配置项的情况下，依旧需要查看文档了解每项含义，除了第一层有一定的提示作用外，后面的层级提示没有很明显的效率提升

2、key 导出的形式在过深的结构下展示没有优势

3、key 导出可能会出现重复，但是代码层面不会有警告或者报错，难以排查，这一点对象形式较为友好

:::



## 配置加载顺序


配置存在优先级（应用代码 >  组件），相对于此运行环境的优先级会更高。


比如在 prod 环境加载一个配置的加载顺序如下，后加载的会覆盖前面的同名配置。


```typescript
-> 组件 config.default.ts
-> 应用 config.default.ts
-> 组件 config.prod.ts
-> 应用 config.prod.ts
```



## 配置合并规则


默认会加载 `**/config.defaut.ts`  的文件以及 `**/config.{环境}.ts`  文件。


比如，下面的代码在 `local` 环境会查找 `config.default.*` 和 `config.local.*` 文件，如果在其他环境，则只会查找 `config.default.*` 和 `config.{当前环境}.*` ，如果文件不存在，则不会加载，也不会报错。
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


为了向前兼容，我们对某些特殊环境的配置读取做了一些处理。这里环境的值指的是根据 `NODE_ENV` 和 `MIDWAY_SERVER_ENV` 的值综合得出的 [结果](environment#AxjGQ)。

| **环境的值** | **读取的配置文件** |
| --- | --- |
| prod | *.default.ts + *.prod.ts  |
| production | *.default.ts +  *.production.ts + *.prod.ts |
| unittest | *.default.ts + *.unittest.ts  |
| test | *.default.ts + *.test.ts + *.unittest.ts |

除了上述表格外，其余都是 `*.default.ts + *.{当前环境}.ts` 的值。


此外，配置的合并使用 [extend2](https://github.com/eggjs/extend2) 模块进行深度拷贝，[extend2](https://github.com/eggjs/extend2) fork 自 [extend](https://github.com/justmoon/node-extend)，处理数组时会存在差异。

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
根据上面的例子，框架直接覆盖数组而不是进行合并。



## 获取配置


Midway 会将配置都保存在内部的配置服务中，整个结构是一个对象，在 Midway 业务代码使用时，使用 `@Config` 装饰器注入。



### 单个配置值


默认情况下，会根据装饰器的字符串参数值，从配置对象中获取。


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



### 深层级别配置值


如果配置对象的值在对象的深处，那么可以用级联的方式获取。


比如数据源为：


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
则可以写复杂的获取表达式来获取值，示例如下。
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



### 整个配置对象


也可以通过 `ALL` 这个特殊属性，来获取整个配置的对象。
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



## 修改配置

在编码过程中，我们有一些可以动态修改配置的地方，用在不同的场景。



### 生命周期中修改


midway 新增了一个异步配置加载的生命周期，可以在配置加载后执行。

```typescript
// src/configuration.ts
import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { join } from 'path';
import { RemoteConfigService } from '../service/remote'; // 自定义的获取远端配置服务

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class MainConfiguration {

  async onConfigLoad(container: IMidwayContainer) {
    // 这里你可以修改全局配置
  	const remoteConfigService = await container.getAsync(RemoteConfigService);
    const remoteConfig = await remoteConfigService.getData();

    // 这里的返回值会和全局的 config 做合并
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

注意，`onConfigLoad` 生命周期会在 egg 插件（若有）初始化之后执行，所以不能用于覆盖 egg 插件所使用的配置。



### bootstrap 中添加配置

可以在启动代码之前添加配置。

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

`configure` 方法可以传递一个 `globalConfig` 的属性，可以在应用启动前传递一个全局配置，结构和 “对象形式的配置一致”，区分环境。



### 使用 API 添加配置


其他场景的修改配置，可以使用 midway 提供的 [API](./built_in_service#midwayconfigservice)。



## 使用环境变量


社区有一些库，比如 `dotenv` 可以加载 `.env` 文件注入到环境中，从而将一些秘钥放在环境中，在 Midway 中可以直接依赖它使用。
```bash
$ npm i dotenv --save
```
可以在项目根目录增加 `.env` 文件，比如下面的内容：
```
OSS_SECRET=12345
OSS_ACCESSKEY=54321
```
我们可以在入口中初始化，比如 `bootstrap.js` 或者 `configuration` 。
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


我们可以在环境配置中使用了。
```typescript
// src/config/config.default

export const oss = {
  accessKey: process.env.OSS_ACCESSKEY,     // 54321
  secret: process.env.OSS_SECRET            // 12345
}
```



## 常见错误


配置未生效的可能性很多，排查思路如下：

- 1、检查 configuration 文件中是否显式配置 `importConfigs` 相关的文件或者目录
- 2、检查应用启动的环境，是否和配置文件一致，比如 prod 的配置肯定不会在 local 出现
- 3、检查是否将普通导出和方法回调导出混用，比如下面的混用的情况



### 1、在构造器（constructor）中获取 @Config 注入的值


**请不要在构造器中 **获取 `@Config()` 注入的属性，这会使得拿到的结果为 undefined。原因是装饰器注入的属性，都在实例创建后（new）才会赋值。这种情况下，请使用 `@Init` 装饰器。
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



### 2、回调和导出写法混用

**下面是错误用法。**

```typescript
export default (appInfo) => {
  const config = {};

  // xxx
  return config;
};

export const keys = '12345';
```

`export const` 定义的值会被忽略。



### 3、export default 和 export const 混用

**下面是错误用法。**

```typescript
export default {
  keys: '12345',
}

export const anotherKey = '54321';
```
位于后面的配置将会被忽略。

### 4、export= 和其他混用

`export=` 混用的情况，如果后面有其他配置，会忽略 `export=` 的值。

```typescript
export = {
  a: 1
}
export const b = 2;
```

编译后结果：

```typescript
export const b = 2;
```

