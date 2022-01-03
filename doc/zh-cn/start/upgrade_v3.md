# Midway v3 升级指南


本篇将介绍从 midway v2 升级为 midway v3 的方式。

从 Midway v2 升级到 Midway v3，会有一些 Breaking Change。本篇文档会详细列出这些 Breaking 的地方，让用户可以提前知道变化，做出应对。



## 面对普通用户


:::info
midway v3 支持从 node v12 起。
:::


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
import * as Validate from '@midwayjs/validate';

@Configuration({
  // ...
  imports: [
    Validate
  ],
})
export class MainConfiguration {
	// ...
}

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
-   './config'													// error
+   join(__dirname, './config')					// ok
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
​

bootstrap.js 中不再需要单独实例化
```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```
作为替代，以组件的形式引入
```typescript
// src/configuration
import * as Web from '@midwayjs/web';
import * as Grpc from '@midwayjs/grpc';

@Configuration({
  // ...
  imports: [
    Web,
    Grpc,
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


## 面对组件/框架开发者


### 组件中 registerObject 不再增加 namespace


在组件开发时，不再增加 namespace 前缀。


旧，组件入口
```typescript
@Configuration({
  namespace: 'A'
  // ...
})
export class ContainerConfiguration {
	
  async onReady(container) {
  	container.registerObject('aaa', 'bbb');
  }
}

container.getAsync('A:aaa'); // => OK
```


新，组件入口
```typescript
@Configuration({
  namespace: 'A'
  // ...
})
export class ContainerConfiguration {
	
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
    await this.framework.run();
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
    if (this.framework.isEnable()) {
    	await this.framework.run();
    }
  }
}

```