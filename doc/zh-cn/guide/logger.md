# 日志

## 简介

Midway 为不同场景提供了一套统一的日志接入方式。通过 `@midwayjs/logger` 包导出的方法，可以方便的接入不同场景的日志系统。

Midway 的日志系统基于社区的 [winston](https://github.com/winstonjs/winston)，是现在社区非常受欢迎的日志库。

实现的功能：

- 日志分级
- 按大小和时间自动切割
- 自定义输出格式
- 统一错误日志



## 日志路径和文件


默认情况下，Midway 会在本地开发和服务器部署时输出日志到**日志根目录**。


- 本地的日志根目录为 `${app.appDir}/logs/项目名` 目录下
- 服务器的日志根目录为用户目录 `${process.env.HOME}/logs/项目名` （Linux/Mac）以及 `${process.env.USERPROFILE}/logs/项目名` （Windows）下，例如 `/home/admin/logs/example-app`。

Midway 会在日志根目录创建一些默认的文件。


- `midway-core.log` 框架、组件打印信息的日志，对应 `coreLogger` 。
- `midway-app.log` 应用打印信息的日志，对应 `appLogger`
- `common-error.log` 所有错误的日志（所有 Midway 创建出来的日志，都会将错误重复打印一份到该文件中）



## 默认日志对象

Midway 默认在框架提供了三种不同的日志，对应三种不同的行为。

| 日志           | 释义                 | 描述                                                         | 常见使用                                                     |
| -------------- | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Core Logger    | 框架，组件层面的日志 | 默认会输出控制台日志和文本日志 `midway-core.log` ，并且默认会将错误日志发送到 `common-error.log` 。 | 框架和组件的错误，一般会打印到其中。                         |
| App Logger     | 业务层面的日志       | 默认会输出控制台日志和文本日志 `midway-app.log` ，并且默认会将错误日志发送到 `common-error.log` 。 | 业务使用的日志，一般业务日志会打印到其中。                   |
| Context Logger | 请求链路的日志       | 默认使用 `appLogger` 进行输出，除了会将错误日志发送到 `common-error.log` 之外，还增加了上下文信息。 | 修改日志输出的标记（Label），不同的框架有不同的请求标记，比如 HTTP 下就会输出路由信息。 |



## 使用日志

Midway 的常用日志使用方法。

### Context Logger

```typescript
import { Get, Inject, Controller, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Controller()
export class HelloController {

  @Inject()
  logger: ILogger;

  @Inject()
  ctx;

  @Get("/")
  async hello(){
    this.logger.info("hello world");
    this.logger.debug('debug info');
		this.logger.warn('WARNNING!!!!');

    // 错误日志记录，直接会将错误日志完整堆栈信息记录下来，并且输出到 errorLog 中
		// 为了保证异常可追踪，必须保证所有抛出的异常都是 Error 类型，因为只有 Error 类型才会带上堆栈信息，定位到问题。
    this.logger.error(new Error('custom error'));
    // ...
    
    // this.logger === ctx.logger
  }
}
```
访问后，我们能在两个地方看到日志输出：


- 控制台看到输出。
- 日志目录的 midway-app.log 文件中


输出结果：
```typescript
2021-07-22 14:50:59,388 INFO 7739 [-/::ffff:127.0.0.1/-/0ms GET /api/get_user] hello world
```



### App Logger

如果我们想做一些应用级别的日志记录，如记录启动阶段的一些数据信息，可以通过 App Logger 来完成。

```typescript
import { Configuration, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Configuration()
export class ContainerConfiguration implements ILifeCycle {
  
  @Logger()
  logger: ILogger;

  async onReady(container: IMidwayContainer): Promise<void> {
    this.logger.debug('debug info');
    this.logger.info('启动耗时 %d ms', Date.now() - start);
    this.logger.warn('warning!');

    this.logger.error(someErrorObj);
  }
  
}
```

注意，这里使用的是 `@Logger()` 装饰器。




## 输出方法和格式


Midway 的日志对象继承与 winston 的日志对象，一般情况下，只提供 `error()` ， `warn()` ， `info()` , `debug` 四种方法。


示例如下。
```typescript
logger.debug('debug info');
logger.info('启动耗时 %d ms', Date.now() - start);
logger.warn('warning!');
logger.error(new Error('my error'));
```


### 默认的输出行为


在大部分的普通类型下，日志库都能工作的很好。


比如：
```typescript
logger.info('hello world');																					// 输出字符串
logger.info(123);																										// 输出数字
logger.info(['b', 'c']);																						// 输出数组
logger.info(new Set([2, 3, 4]));																		// 输出 Set
logger.info(new Map([['key1', 'value1'], ['key2', 'value2']]));			// 输出 Map
```
> Midway 针对 winston 无法输出的 `Array` ， `Set` ， `Map` 类型，做了特殊定制，使其也能够正常的输出。


不过需要注意的是，日志对象在一般情况下，只能传入一个参数，它的第二个参数有其他作用。
```typescript
logger.info('plain error message', 321);			// 会忽略 321
```


### 错误输出


针对错误对象，Midway 也对 winston 做了定制，使其能够方便的和普通文本结合到一起输出。
```typescript
// 输出错误对象
logger.error(new Error('error instance'));

// 输出自定义的错误对象
const error = new Error('named error instance');
error.name = 'NamedError';
logger.error(error);

// 文本在前，加上 error 实例
logger.info('text before error', new Error('error instance after text'));
```
:::warning
注意，错误对象只能放在最后，且有且只有一个，其后面的所有参数都会被忽略。
:::




### 格式化内容
基于 `util.format` 的格式化方式。
```typescript
logger.info('%s %d', 'aaa', 222);
```
常用的有


- `%s` 字符串占位
- `%d` 数字占位
- `%j` json 占位

更多的占位和详细信息，请参考 node.js 的 [util.format](https://nodejs.org/dist/latest-v14.x/docs/api/util.html#util_util_format_format_args) 方法。



### 输出自定义对象或者复杂类型


基于性能考虑，Midway（winston）大部分时间只会输出基本类型，所以当输出的参数为高级对象时，**需要用户手动转换为需要打印的字符串**。


如下示例，将不会得到希望的结果。
```typescript
const obj = {a: 1};
logger.info(obj);					// 默认情况下，输出 [object Object]
```
需要手动输出希望打印的内容。
```typescript
const obj = {a: 1};
logger.info(JSON.stringify(obj));				// 可以输出格式化文本
logger.info(a.1);												// 直接输出属性值
logger.info('%j', a);										// 直接占位符输出整个 json
```



### 纯输出内容


特殊场景下，我们需要单纯的输出内容，不希望输出时间戳，label 等和格式相关的信息。这种需求我们可以使用 `write` 方法。

`write` 方法是个非常底层的方法，并且不管什么级别的日志，它都会写入到文件中。


虽然 `write` 方法在每个 logger 上都有，但是我们只在 `IMidwayLogger` 定义中提供它，我们希望你能明确的知道自己希望调用它。
```typescript
(logger as IMidwayLogger).write('hello world');		// 文件中只会有 hello world
```



## 日志定义


默认的情况，用户应该使用最简单的 `ILogger` 定义。
```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {
  
  @Inject()
  logger: ILogger;						// 获取上下文日志
  
  async getUser() {
  	this.logger.info('hello user');
  }

}
```


`ILogger` 定义只提供最简单的 `debug` ， `info` ， `warn` 以及 `error` 方法。


在某些场景下，我们需要更为复杂的定义，比如修改日志属性或者动态调节，这个时候需要使用更为复杂的 `IMidwayLogger` 定义。


```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { IMidwayLogger } from '@midwayjs/logger';

@Provide()
export class UserService {
  
  @Inject()
  logger: IMidwayLogger;						// 获取上下文日志
  
  async getUser() {
    this.logger.disableConsole();		// 禁止控制台输出
  	this.logger.info('hello user');	// 这句话在控制台看不到
    this.logger.enableConsole();		// 开启控制台输出
    this.logger.info('hello user');	// 这句话在控制台可以看到
  }

}
```
`IMidwayLogger`  现有完整定义如下，下面文档介绍的方法，都在其中。
```typescript
export interface IMidwayLogger extends ILogger {
  disableConsole();
  enableConsole();
  disableFile();
  enableFile();
  disableError();
  enableError();
  isEnableFile(): boolean ;
  isEnableConsole(): boolean;
  isEnableError(): boolean ;
  updateLevel(level: LoggerLevel): void;
  updateFileLevel(level: LoggerLevel): void;
  updateConsoleLevel(level: LoggerLevel): void;
  updateDefaultLabel(defaultLabel: string): void;
  updateDefaultMeta(defaultMeta: object): void;
  updateTransformableInfo(customInfoHandler: LoggerCustomInfoHandler): void;
  getDefaultLabel(): string;
  getDefaultMeta(): Record<string, unknown>;
  write(...args): boolean;
  add(transport: any): any;
  remove(transport: any): any;
  close(): any;
}
```



## 日志等级


winston 的日志等级分为下面几类，日志等级依次降低（数字越大，等级越低）：
```typescript
const levels = { 
  all: 0,
  error: 1,
  warn: 2,
  info: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
```
在 Midway 中，为了简化，一般情况下，我们只会使用 `error` ， `warn` ， `info` ， `debug` 这四种等级。


日志等级表示当前可输出日志的最低等级。比如当你的日志 level 设置为 `warn`  时，仅 `warn` 以及更高的 `error` 等级的日志能被输出。



### 框架的默认等级


在 Midway 中，有着自己的默认日志等级。


- 在开发环境下（local，test，unittest），日志等级统一为 `info` 。
- 在服务器环境（除开发环境外），为减少日志数量，日志等级统一为 `warn` 。



### 调整日志等级

一般情况下，我们不建议调整全局默认的日志等级，而是调整特定的 logger 的日志等级，比如：

调整 `coreLogger` 或者 `appLogger` 。

```typescript
export const midwayLogger = {
  clients: {
    coreLogger: {
      level: 'warn',
    	consoleLevel: 'warn'
      // ...
    },
    appLogger: {
      level: 'warn',
    	consoleLevel: 'warn'
      // ...
    }
  }
};
```

特殊场景，也可以临时调整全局的日志等级。

```typescript
export const midwayLogger = {
  default: {
    level: 'info',
    consoleLevel: 'warn'
  },
  // ...
};
```



### 动态调整日志等级


在开发调试时，我们往往有动态调整等级的诉求。在 Midway 的日志下，我们可以使用方法动态的调整日志等级。
```typescript
logger.updateLevel('debug');			// 动态调整等级为 debug
```


也可以单独调整文本和控制台输出的等级。
```typescript
// 动态调整文件的日志等级
logger.updateFileLevel('warn');
// 动态调整控制台输出日志等级
logger.updateConsoleLevel('error');
```



## 日志切割（轮转）


默认行为下，同一个日志对象**会生成两个文件**。

以 `midway-core.log` 为例，应用启动时会生成一个带当日时间戳 `midway-core.YYYY-MM-DD` 格式的文件，以及一个不带时间戳的 `midway-core.log` 的软链文件。

> windows 下不会生成软链


为方便配置日志采集和查看，该软链文件永远指向最新的日志文件。


当凌晨 `00:00` 时，会生成一个以当天日志结尾 `midway-core.log.YYYY-MM-DD` 的形式的新文件。


同时，当单个日志文件超过 200M 时，也会自动切割，产生新的日志文件。



## 自定义日志


如果用户不满足于默认的日志对象，也可以自行创建。



### 增加自定义日志

可以如下配置：

```typescript
export const midwayLogger = {
  clients: {
    xxLogger: {
      level: 'info'
      fileLogName: 'xxx.log'
      // ...
    }
  }
} as MidwayConfig['midwayLogger'];
```

自定义的日志可以通过 `@Logger('xxLogger')` 获取。


可配置的所有选项如下，用户可以自行调整。
```typescript
export interface LoggerOptions {
  dir?: string;
  fileLogName?: string;
  errorLogName?: string;
  label?: string;
  disableConsole?: boolean;
  disableFile?: boolean;
  disableError?: boolean;
  consoleLevel?: LoggerLevel;
  fileLevel?: LoggerLevel;
  fileMaxSize?: string;
  fileMaxFiles?: string;
  fileDatePattern?: string;
  errMaxSize?: string;
  errMaxFiles?: string;
  errDatePattern?: string;
  disableFileSymlink?: boolean;
  disableErrorSymlink?: boolean;
  printFormat?: (info) => string;
  format?: logform.format;
  eol?: string;
}
```



| **参数名** | **参数类型** | **默认值** | **描述** |
| --- | --- | --- | --- |
| dir | string | window: `process.env.USERPROFILE`
Linux/mac: `process.env.HOME` | 文本日志的根目录，默认为当前的用户根目录 |
| level | debug|info|warn|error |  | 全局日志等级 |
| fileLogName | string | midway-core.log | 文本日志写入的文件名 |
| errorLogName | string | common-error.log | 错误日志写入的文件名 |
| defaultLabel | string | undefined | 输出的默认标签，[] 中的值 |
| disableConsole | boolean | false | 禁止控制台输出 |
| disableFile | boolean | false | 禁止文本日志输出 |
| disableError | boolean | false | 禁止错误日志输出 |
| disableFileSymlink | boolean | false | 禁止生成软链，默认情况下，会生成带有时间戳的文件加上一个没有时间戳的软链文件。 |
| disableErrorSymlink | boolean | false | 禁止生成软链，默认情况下，会生成带有时间戳的文件加上一个没有时间戳的软链文件。 |
| consoleLevel | string | silly | 最低的控制台日志可见等级，可覆盖全局的日志等级 |
| fileLevel | string | silly | 最低的文本日志可见等级，可覆盖全局的日志等级 |
| fileMaxSize | string | 200m | 日志切割的最大尺寸，默认 `200m` |
| fileMaxFiles | string | 31d（31天） | 最多保留的文件时间，默认 `31d` |
| fileDatePattern | string | YYYY-MM-DD | 文件后缀时间戳格式 |
| errMaxSize | string | 200m | 日志切割的最大尺寸，默认 `200m` |
| errMaxFiles | string | 31d（31天） | 最多保留的文件时间，默认 `31d` |
| errDatePattern | string | YYYY-MM-DD | 错误日志文件后缀时间戳格式 |
| printFormat | (info: any) => string; | midway 默认显示格式 | 默认的日志输出显示格式，传入一个回调函数进行覆盖。 |
| format | logform.Format | midway 默认 format | 默认的 winston format 格式。 |
| eol | string | os.EOL | 默认是操作系统的换行符 |



### 修改显示格式（Display）


显示格式指的是日志输出时单行文本的字符串结构。Miidway 对 Winston 的日志做了定制，提供了一些默认对象。


显示格式是一个返回字符串结构的方法，参数为 Winston 的 [info 对象](https://github.com/winstonjs/logform#info-objects)。


默认情况下，我们的显示格式为：
```typescript
info => {
  return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}${info.message}`;
}
```
输出如下：
```
2020-12-30 07:50:10,453 ERROR 3847 [customLabel] Error: another test error
    at Object.<anonymous> (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18)
```
info 对象的默认属性如下：

| **属性名** | **描述** | **示例** |
| --- | --- | --- |
| timestamp | 时间戳，默认为 `'YYYY-MM-DD HH:mm:ss,SSS` 格式。 | 2020-12-30 07:50:10,453 |
| level | 小写的日志等级 | info |
| LEVEL | 大写的日志等级 | INFO |
| pid | 当前进程 pid | 3847 |
| labelText | 标签的聚合文本 | [a:b:c] |
| message | 普通消息 + 错误消息 + 错误堆栈的组合 | 1、普通文本，如 `123456` ， `hello world`|
|2、错误文本（错误名+堆栈）Error: another test error at Object.anonymous (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18)|||
|3、普通文本+错误文本 hello world Error: another test error at Object.anonymous (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18) |||
| stack | 错误堆栈 |  |
| originError | 原始错误对象 | 错误实例本身 |
| originArgs | 原始的用户入参 | [ 'a', 'b', 'c' ] |


示例，创建一个自定义格式的 Logger。


```typescript
// src/config/config.default.ts
export const midwayLogger = {
  clients: {
    custom1: {
      printFormat: (info) => {
      	return `${info.timestamp} ${info.level} ${info.message}`;
      }
      // ...
    }
  }
} as MidwayConfig['midwayLogger'];


// 使用
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;
  
  @Logger('custom1')
  customLogger;
  
	async onReady() {
    this.customLogger.info('hello world');
  }
}
```
这样该日志的输出效果则为：
```typescript
2020-12-30 07:50:10,453 info hello world
```




### 覆盖请求链路日志的 Label


每个框架（Framework）可能会有默认的上下文日志输出，ContextLogger 是基于 appLogger 来打日志的，**会复用 appLogger 的所有信息**，唯一不同的是，ContextLogger 会输出特殊的 label。


比如 HTTP 下的默认输出为：
```
2021-01-20 15:13:25,408 INFO 66376 [-/127.0.0.1/-/5ms GET /] xxxx
```
label 为 `-/127.0.0.1/-/5ms GET /` 这一部分。


我们可以通过重写上下文日志类来修改上下文输出信息（ContextLogger）的 label。


首先，你需要定义一个文件，继承默认的 `MidwayContextLogger` 类，实现 `formatContextLabel` 来返回 label 内容。比如 HTTP 下：
```typescript
// src/custom/logger.ts

import { MidwayContextLogger } from '@midwayjs/logger';
import { Context } from 'egg';

export class MidwayCustomContextLogger extends MidwayContextLogger<Context> {
  formatContextLabel() {
    const ctx = this.ctx;
    return `${Date.now() - ctx.startTime}ms ${ctx.method}`;
  }
}

```
Midway 为每个框架的 app 增加了一个 `setContextLoggerClass` 方法，用于覆盖默认的 `ctx.logger` 输出的 label。


你可以在启动时进行覆盖。
```typescript
// configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { MidwayCustomContextLogger } from './custom/logger';
import { Application } from 'egg';

@Configuration()
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: Application;

  async onReady(container: IMidwayContainer): Promise<void> {
    this.app.setContextLoggerClass(MidwayCustomContextLogger);
  }
}
```
则你在使用 `ctx.logger` 输出时，会默认变成你 format 的样子。
```typescript
ctx.logger.info('hello world');  
// 2021-01-28 11:10:19,334 INFO 9223 [2ms POST] hello world
```



### 日志输出管道（Transport）


Midway 的日志对象基于 Winston 日志，默认包含三个日志管道。


- `ConsoleTransport` 用于向控制台输出日志
- `FileTransport` 用于向文件写入日志
- `ErrorTransport` 用于将 Error 级别输出到特定的错误日志

我们可以通过方法动态更新这三个管道，控制输出。

```typescript
logger.enableFile();
logger.disableFile();

logger.enableConsole();
logger.disableConsole();

logger.enableError();
logger.disableError();
```

同时，还提供了判断的 API。

```typescript
logger.isEnableConsole();
logger.isEnableFile();
logger.isEnableError();
```

