# 2.x 升级指南

本篇将介绍从 midway v2 升级为 midway v3 的方式。

从 Midway v2 升级到 Midway v3，会有一些 Breaking Change。本篇文档会详细列出这些 Breaking 的地方，让用户可以提前知道变化，做出应对。



## 自动升级工具

**在升级前，请切出一个新的分支，避免升级失败导致无法恢复！！！**

拷贝以下脚本，在项目根目录执行：

```bash
$ npx --ignore-existing midway-upgrade
```

:::tip

由于业务情况各异，请在脚本升级之后，再进行手动升级的核对。

:::



## 手动升级

**midway v3 支持从 node v12 起。**


### 包版本更新

所有的组件包，核心包都将升级为 3.x 版本。

```json
{
  "dependencies": {
    "@midwayjs/bootstrap": "^3.0.0",
    "@midwayjs/core": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "@midwayjs/koa": "^3.0.0",
    "@midwayjs/task": "^3.0.0",
  },
  "devDependencies": {
    "@midwayjs/cli": "^1.2.90",
    "@midwayjs/luckyeye": "^1.0.0",
    "@midwayjs/mock": "^3.0.0",
    // ...
  }
}

```

`@midwayjs/cli` 和 `@midwyajs/luckeye`, `@midwayjs/logger` 的版本除外。



### Query/Body/Param/Header 装饰器变更


主要是默认无参数下的行为。


旧
```typescript
async invoke(@Query() name) {
	// ctx.query.name
}
```
新
```typescript
async invoke(@Query() name) {
	// ctx.query
}

async invoke(@Query('name') name) {
	// ctx.query.name
}
```



### Validate/Rule 装饰器


旧
```typescript
import { Validate, Rule, RuleType } from '@midwayjs/decorator';
```
新
```typescript
import { Validate, Rule, RuleType } from '@midwayjs/validate';
```
由于 validate 抽象成了组件，需要在代码中安装依赖并开启。
```typescript
// src/configuration
import * as validate from '@midwayjs/validate';

@Configuration({
  // ...
  imports: [
    validate
  ],
})
export class MainConfiguration {
	// ...
}

```

### task 组件配置 key 变更

旧

```typescript
export const taskConfig = {};
```

新

```typescript
export const task = {};
```



### 配置的绝对路径


不再支持相对路径


旧
```typescript
// src/configuration

@Configuration({
  // ...
  importConfigs: [
    './config'			// ok
  ]
})
export class MainConfiguration {
	// ...
}

```
新
```diff
// src/configuration
import { join } from 'path';

@Configuration({
  // ...
  importConfigs: [
-   './config'							 // error
+   join(__dirname, './config')          // ok
  ]
})
export class MainConfiguration {
	// ...
}

```



### 使用默认框架/多框架


旧，会在 bootstrap.js 中引入
```typescript
const WebFramework = require('@midwayjs/koa').Framework;
const GRPCFramework = require('@midwayjs/grpc').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap
  .load(config => {
    return new WebFramework().configure(config.cluster);
  })
  .load(config => {
    return new GRPCFramemwork().configure(config.grpcServer);
  })
  .run();
```


新版本


bootstrap.js 中不再需要单独实例化
```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```
作为替代，以组件的形式引入
```typescript
// src/configuration
import * as web from '@midwayjs/web';
import * as grpc from '@midwayjs/grpc';

@Configuration({
  // ...
  imports: [
    web,
    grpc,
    //...
  ],
})
export class MainConfiguration {
	// ...
}

```


其他影响：



- 1、测试中不再需要使用 createBootstrap 方法从 bootstrap.js 启动
- 2、原有入口 Framework 的配置现在可以放到 config.*.ts 中，以框架名作为 key



### 删除了一批 IoC 容器 API


移除 container 上的下列方法


- getConfigService(): IConfigService;
- getEnvironmentService(): IEnvironmentService;
- getInformationService(): IInformationService;
- setInformationService(service: IInformationService): void;
- getAspectService(): IAspectService;
- getCurrentEnv(): string;


现在都有相应的框架内置服务来替代。


比如旧写法：
```typescript
const environmentService = app.getApplicationContext().getEnvironmentService();
const env = environmentService.getCurrentEnvironment();
```


新写法
```typescript
const environmentService = app.getApplicationContext().get(MidwayEnvironmentService)
const env = environmentService.getCurrentEnvironment();
```



## @midwayjs/web（egg）部分

### 启动端口

新版本框架启动会读取一个端口配置，如果未配，可能不会启动端口监听。

```json
// src/config/config.default
export default {
  // ...
  egg: {
    port: 7001,
  },
}
```



### 添加 egg-mock

由于框架移除了 egg-mock 包，在新版本 `package.json` 需要手动引用。

```json
{
  "devDependencies": {
    "egg-mock": "^1.0.0",
    // ...
  }
}
```



### 日志

新版本，统一使用 @midwayjs/logger，不管是不是启用 egg logger。

为了和 egg 日志不冲突，我们使用了新的 key，原有的 `midwayFeature` 字段不再使用。

旧

```typescript
export const logger = {
  level: 'warn',
  consoleLevel: 'info'
}
```

新

```typescript
export const midwayLogger = {
  default: {
    level: 'warn',
    consoleLevel: 'info'
  }
}
```

Egg 的 `customLogger` 字段，针对无法修改的 egg 插件，我们做了兼容，对于业务代码，最好做修改。

```typescript
export const midwayLogger = {
  default: {
    level: 'warn',
    consoleLevel: 'info'
  },
  clients: {
    // 自定义日志
  	customLoggerA: {
  		// ...
  	}
  }
}
```

其余的更具体配置，请参考 [日志章节 ](logger) 中的自定义部分。



### egg 插件

在 Midway3 中，为了文档和行为统一，我们关闭了大部分 egg 默认插件。

新版本默认插件如下：

```javascript
module.exports = {
  onerror: true,
  security: true,
  static: false,
  development: false,
  watcher: false,
  multipart: false,
  logrotator: false,
  view: false,
  schedule: false,
  i18n: false,
}
```

请酌情开启（可能会和 midway 能力冲突）。

默认的 egg 日志切割插件（logrotator），由于日志不再支持 egg logger，我们在框架中直接关闭了（midway logger 自带了切割）。



### 定时任务

如果希望使用老的 `@Schedule` 装饰器，需要额外安装 `midway-schedule` 包，并以 egg 插件的形式引入。

```typescript
// src/config/plugin.ts

export default {
  schedule: true,
  schedulePlus: {
    enable: true,
    package: 'midway-schedule',
  }
  // ...
}
```





## 其他面对组件/框架开发者的调整



### 组件中 registerObject 不再增加 namespace


在组件开发时，不再增加 namespace 前缀。


旧，组件入口
```typescript
@Configuration({
  namespace: 'A'
  // ...
})
export class MainConfiguration {

  async onReady(container) {
  	container.registerObject('aaa', 'bbb');
  }
}

container.getAsync('A:aaa'); // => OK
```


新组件入口
```typescript
@Configuration({
  namespace: 'A'
  // ...
})
export class MainConfiguration {

  async onReady(container) {
  	container.registerObject('aaa', 'bbb');
  }
}

container.getAsync('aaa'); // => OK
```




### 自定义框架部分


自定义框架的变化比较大，框架组件化是这一版本的目标。有几个地方需要修改。


**1、在原框架上增加 @Framework 标识**


旧
```typescript
export class CustomKoaFramework extends BaseFramework {
	// ...
}
```
新
```typescript
import { Framework } from '@midwayjs/decorator';

@Framework()
export class CustomKoaFramework extends BaseFramework {
	// ...
}
```


**2、在入口处按组件规范导出 Configuration**


你可以在 configuration 中使用生命周期，和组件相同。`run` 方法将在新增的 `onServerReady` 这个生命周期显式调用执行。
```typescript
import { Configuration,Inject } from '@midwayjs/decorator';
import { MidwayKoaFramework } from './framework';

@Configuration({
  namespace: 'koa',
})
export class KoaConfiguration {
  @Inject()
  framework: MidwayKoaFramework;

  async onReady() {}

  async onServerReady() {
    // ...
  }
}

```


**3、框架开发时**

**需要注意的是，由于框架初始化在用户生命周期前，所以 applicationInit 的时候，不要通过 @Config 装饰器注入配置，而是调用 configService 去获取。**


```typescript
import { Framework } from '@midwayjs/decorator';

@Framework()
export class CustomKoaFramework extends BaseFramework {

   configure() {
     /**
     * 这里返回你的配置
     * 返回的值会赋值到 this.configurationOptions，对接原来的用户显式入参
     *
     */
     return this.configService.getConfiguration('xxxxxxx');
   }

  /**
   * 这个新增的方法，用来判断框架是否加载
   * 有时候组件中包括 server 端（框架）和 client 端，就需要判断
   *
   */
   isEnable(): boolean {
     return this.configurationOptions.services?.length > 0;
   }

	// ...
}
```

这样在外面使用时也可以判断。

```typescript
import { Configuration,Inject } from '@midwayjs/decorator';
import { MidwayKoaFramework } from './framework';

@Configuration({
  namespace: 'koa',
})
export class KoaConfiguration {
  @Inject()
  framework: MidwayKoaFramework;

  async onReady() {}

  async onServerReady() {
    // 如果 isEnable 为 true，框架会默认调用 framework.run()
    // 如果一开始 enable 为 false，也可以延后去手动 run
    if (/* 延后执行 */) {
    	await this.framework.run();
    }
  }
}

```
