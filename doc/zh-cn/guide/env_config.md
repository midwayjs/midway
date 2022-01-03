# 多环境配置

配置是我们常用的功能，而且在不同的环境，经常会使用不同的配置信息。


本篇我们来介绍 Midway 如何加载不同环境的业务配置。


## 全局容器配置和业务配置的区别


`src/configuration.ts` 文件用于配置依赖注入容器的行为，是整个 Midway 最重要的文件。其中的 `@Configuration` 装饰器能控制整个 Midway 依赖注入容器的加载行为，例如组件加载，全局生命周期调整等能力。


依赖注入容器包含多个服务，`ConfigService`  是依赖注入容器的其中一个默认服务，用于加载业务配置。我们可以通过在 `@configuration` 装饰器中配置这个服务的行为，来加载不同环境 ，自定义的业务配置文件。


业务配置只跟业务本身相关，和框架不耦合，文件数量不定，内容也是自定义的。


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


配置不是必须项，请酌情添加自己需要的环境配置。


## 业务配置加载


然后我们可以在 `src/configuration.ts` 中配置这个文件（目录），框架就知道加载它了。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class ContainerLifeCycle {
}	
```
### 1、目录或者文件查找加载


可以指定加载一个目录，目录里所有的 `config.*.ts` 都会被扫描加载。


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
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class ContainerLifeCycle {
}	
```


**示例：指定特定文件**


手动指定一批文件时，这个时候如果文件不存在，则会报错。


```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/config.default'),
    join(__dirname, './config/config.local'),
    join(__dirname, './config/custom.local')		// 可以使用自定义的命名，只要中间部分带环境就行
  ]
})
export class ContainerLifeCycle {
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
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
    join(__dirname, '../customConfig.default'),
  ]
})
export class ContainerLifeCycle {
}	
```


### 2、对象形式加载


在特殊场景下，比如希望 bundle/package 等和目录结构无关的需求，可以使用标准的模块加载方式来加载配置。
​

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
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
export class ContainerLifeCycle {
}	
```
`importConfigs` 中的数组中传递配置对象，每个对象的 key 为环境，值为环境对应的配置值，midway 在启动中会根据环境来加载对应的配置。


## 配置合并规则


框架会加载 `**/config.defaut.ts`  的文件以及 `**/config.{环境}.ts`  文件。


比如，下面的代码在 `local` 环境会查找 `config.default.*` 和 `config.local.*` 文件，如果在其他环境，则只会查找 `config.default.*` 和 `config.{当前环境}.*` ，如果文件不存在，则不会加载，也不会报错。
```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class ContainerLifeCycle {
}	
```


为了向前兼容，我们对某些特殊环境的配置读取做了一些处理。这里环境的值指的是根据 `NODE_ENV` 和 `MIDWAY_SERVER_ENV` 的值综合得出的 [结果](environment#AxjGQ)。

| **环境的值** | **读取的配置文件** |
| --- | --- |
| prod | *.default.ts + *.prod.ts  |
| production | *.default.ts +  *.production.ts + *.prod.ts |
| unittest | *.default.ts + *.unittest.ts  |
| test | *.default.ts + *.test.ts + *.unittest.ts |
|  |  |

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


## 配置格式


### 对象形式


配置文件格式为 object，比如：
```typescript
// src/config/config.default.ts

export const userService = {
	appname: 'test'
}

export const customKey = {
	appname: 'abc'
}
```


### 函数形式


配置文件为一个带有 `appInfo` 参数的函数。通过这样返回方法的形式，在运行期会被自动执行，将返回值合并进完整的配置对象。
```typescript
// src/config/config.default.ts

export default appInfo => {
  return {
    view: {
      root: path.join(appInfo.baseDir, 'view'),
    },
  };
};

```
这个函数的参数为 `AppInfo` 类型，值为以下内容。


| **appInfo** | **说明** |
| --- | --- |
| pkg | package.json |
| name | 应用名，同 pkg.name |
| baseDir | 应用代码的 src （本地开发）或者 dist （上线后）目录 |
| appDir | 应用代码的目录 |
| HOME | 用户目录，如 admin 账户为 /home/admin |
| root | 应用根目录，只有在 local 和 unittest 环境下为 baseDir，其他都为 HOME。 |



## 配置加载顺序


配置存在优先级（应用代码 > 框架 > 组件），相对于此运行环境的优先级会更高。


比如在 prod 环境加载一个配置的加载顺序如下，后加载的会覆盖前面的同名配置。


```typescript
-> 组件 config.default.ts
-> 框架 config.default.ts
-> 应用 config.default.ts
-> 组件 config.prod.ts
-> 框架 config.prod.ts
-> 应用 config.prod.ts
```


## 代码中使用配置


Midway 会将配置都保存在内部的配置服务中，整个结构是一个对象，在 Midway 业务代码使用时，使用 `@Config` 装饰器注入。


### 单个配置值


默认情况下，如果不传参数，将以属性名作为 key，从配置对象中获取值。


```typescript
import { Config } from '@midwayjs/decorator';

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


```typescript
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
import { Config } from '@midwayjs/decorator';

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
import { Config, ALL } from '@midwayjs/decorator';

export class IndexHandler {

  @Config(ALL)
  allConfig;
  
  async handler() {
  	console.log(this.allConfig);  // { userService: { appname: 'test'}}
  }
}
```


## 动态添加配置


如果项目启动后，还需要修改配置，可以使用 midway 提供的 API。
```typescript
app.addConfigObject({
	a: 1,
  b: 2
});
```
该 API 可以让新增的配置对象和现有的配置合并。


## 异步初始化配置


midway 新增了一个异步配置加载的生命周期，可以在配置加载后执行。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { IMidwayContainer } from '@midwayjs/core';
import { join } from 'path';
import { RemoteConfigService } from '../service/remote'; // 自定义的获取远端配置服务

@Configuration({
  importConfigs: [
    join(__dirname, './config/'),
  ]
})
export class ContainerLifeCycle {
  
  async onConfigLoad(container: IMidwayContainer) {
    // 这里你可以修改全局配置
  	const remoteConfigService = await container.getAsync(RemoteConfigService);
    const remoteConfig = await remoteConfigService.getData();
    
    // 这里的返回值会和全局的 config 做合并
    return {
    	data: remoteConfig
    };
  }
}	
```

注意，`onConfigLoad` 生命周期会在 egg 插件（若有）初始化之后执行，所以不能用于覆盖 egg 插件所使用的配置。


老的 bootstrap 用法，请参考 [框架前异步逻辑](multi_framework_start#n5oDJ)。


## 配置的特殊 TS 写法问题

### export= 的情况
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
### export default 的情况
`export default` 混用的情况，虽然编译没有问题，但是框架层会只读取 `default` 的配置。
```typescript
export default {
	a: 1
}
export const b = 2;
```
框架侧只会读取 `default` 的值。
```typescript
export default {
	a: 1
}
```


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
import { Configuration } from '@midwayjs/decorator';
import * as dotenv from 'dotenv';

// load .env file in process.cwd
dotenv.config();

@Configuration({
  //...
})
export class AutoConfiguration {
  async onReady(container) {
    
  }
}

```


我们可以在环境配置中使用了。
```typescript
// src/config/config.default

export const oss = {
	accessKey: process.env.OSS_ACCESSKEY,			// 54321
  secret: process.env.OSS_SECRET						// 12345
}
```




## 常见错误


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

### 2、配置写法混用


1、比如在 egg 里的回调和导出混用。


**下面是错误用法。**
```typescript
export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // xxx
  return config;
};

export const keys = '12345';
```


`export const` 定义的值会被忽略。


2、比如 export default 和 export const 混用。


**下面是错误用法。**
```typescript
export default {
	keys: '12345',
}

export const anotherKey = '54321';
```
位于后面的配置将会被忽略。


### 3、配置没有生效


可能性很多，排查思路如下：



- 1、检查 configuration 文件中是否显式配置 `importConfigs` 相关的文件或者目录
- 2、检查应用启动的环境，是否和配置文件一致，比如 prod 的配置肯定不会在 local 出现
- 3、检查是否将普通导出和方法回调导出混用，比如 "常见错误2“