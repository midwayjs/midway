# 日志

## 简介

Midway 为不同场景提供了一套统一的日志接入方式。通过 `@midwayjs/logger` 包导出的方法，可以方便的接入不同场景的日志系统。

Midway 的日志系统基于社区的 [winston](https://github.com/winstonjs/winston)，是现在社区非常受欢迎的日志库。

## 普通使用


首先我们学会Midway的日常日志使用方法。

```typescript
import { Get } from '@midwayjs/decorator';
import { Inject, Controller, Provide } from '@midwayjs/decorator';

@Provide()
@Controller()
export class HelloController{

  @Inject()
  logger;

  @Inject()
  ctx;

  @Get("/")
  async ctx(){
    this.logger.info("hello world");
    this.ctx.body = 'hello world';
  }
}
```
访问后，我们能在两个地方看到日志输出：


- console栏看到输出。 
- 日志目录的midway-app.log 文件中。


输出结果：
```typescript
2021-07-22 14:50:59,388 INFO 7739 [-/::ffff:127.0.0.1/-/0ms GET /api/get_user] hello world
```


以上是用户在项目开发的基本使用。如果有更多高阶用法，请继续阅读接下来的章节。


## 默认日志对象


默认情况下，Midway 已经将日志库埋入到整个框架中，在框架启动时已经能够自动输出信息到控制台，以及输出到文件。


Midway 日志的默认逻辑为：


- 将日志输出到控制台和写入文件
- 按日期每天切割，以及按大小切割
- 将错误（ `.error()` 输出的内容）统一输出到一个固定的错误文件



Midway 默认在框架提供了三种不同的日志，对应三种不同的行为。

| 框架，组件层面的日志，我们叫他 `coreLogger`
 | 默认会输出控制台日志和文本日志 `midway-core.log` ，并且默认会将错误日志发送到 `common-error.log` 。 |  |
| --- | --- | --- |
| 业务层面的日志，我们叫他 `appLogger`

 | 默认会输出控制台日志和文本日志 `midway-app.log` ，并且默认会将错误日志发送到 `common-error.log` 。 |  |
| 请求链路的日志，我们叫它上下文日志对象（ContextLogger） | 默认使用 `appLogger` 进行输出，除了会将错误日志发送到 `common-error.log` 之外，还增加了上下文信息。 | 修改日志输出的标记（Label），不同的框架有不同的请求标记，比如 HTTP 下就会输出路由信息。 |



## 日志路径和文件


默认情况下，Midway 会在本地开发和服务器部署时输出日志到**日志根目录**。


- 本地的日志根目录为 `${app.appDir}/logs/项目名` 目录下
- 服务器的日志根目录为用户目录 `${process.env.HOME}/logs/项目名` （Linux/Mac）以及 `${process.env.USERPROFILE}/logs/项目名` （Windows）下，例如 `/home/admin/logs/example-app`。



Midway 会在日志根目录创建一些默认的文件。


- `midway-core.log` 框架、组件打印信息的日志，对应 `coreLogger` 。
- `midway-app.log` 应用打印信息的日志，对应 `appLogger`
- `common-error.log` 所有错误的日志（所有 Midway 创建出来的日志，都会将错误重复打印一份到该文件中）



:::info
在 EggJS 下，为了兼容以前的日志，依旧处理将日志打印在 `midway-web.log` 下。
:::


## 使用日志对象


一般来说，框架开发者需要获取到 `coreLogger` ，记录框架，组件层面的日志。而业务开发者，需要获取到 `appLogger` 来记录业务日志。在业务和请求相关的流程中，需要拿到上下文日志对象，方便追踪请求。


### 使用装饰器获取日志对象
在任意类中，我们可以通过装饰器来获取日志对象。下面是一个通过装饰器获取各种默认日志对象的方式。


**1、获取 **`**coreLogger**`
```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {

  @Logger()
  coreLogger: ILogger;				// 获取 coreLogger
  
  @Logger('coreLogger')
 	anotherLogger: ILogger;			// 这里和依赖注入的规则相同，依旧获取的是 coreLogger
  
  async getUser() {
    // this.coreLogger === this.anotherLogger
    this.coreLogger.warn('warn message');
  }

}
```


**2、获取 **`**appLogger**`


为了使用更简单，我们将 `appLogger` 的 key 变为了最为普通的 `logger` 。
```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {
  
  @Logger()
  logger: ILogger;						// 获取 appLogger
  
  async getUser() {
  	this.logger.info('hello user');
    this.coreLogger.warn('warn message');
  }

}
```


**3、获取上下文日志对象（Context Logger）**


上下文日志是在每个请求实例中动态创建的日志对象，因此它和**请求作用域**绑定，即和**请求实例**绑定。


Midway 默认会将上下文日志对象挂载到上下文（ctx）上，即 `ctx.logger` 。


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
:::info
和全局的日志不同，上下文日志对象，默认会放在请求作用域的依赖注入容器中，它的 key 为 logger，所以可以使用 `Inject` 装饰器注入它。
:::


### 使用 API 接口获取日志对象


有时候，我们不在 Class 的场景下，我们可以从 `app` 上的方法来获取这些默认的日志对象。
```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {
  
  @App()
  app: IMidwayApplication;
  
  @Inject()
  ctx;

  async getUser() {
  	this.app.getLogger('logger').info('hello user');				// 获取 appLogger
    this.app.getLogger('coreLogger').warn('warn message');	// 获取 coreLogger
    // this.ctx.logger 获取请求上下文日志
  }

}
```


### 使用全局 API 获取


当上述两种方法都无法获取的时候，比如在静态方法中，我们可以从全局的 [日志容器](logger#7FRdi) 中获取日志对象。
```typescript
import { loggers } from '@midwayjs/logger';

// 获取 coreLogger
loggers.getLogger('coreLogger')

// 获取 appLogger
loggers.getLogger('logger');
```
更多的信息，可以查看 [日志容器](logger#7FRdi) 的介绍。


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
:::info
Midway 针对 winston 无法输出的 `Array` ， `Set` ， `Map` 类型，做了特殊定制，使其也能够正常的输出。
:::


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



### 动态调整等级


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


## 日志输出管道（Transport）


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


## 日志切割（轮转）


默认行为下，同一个日志对象**会生成两个文件**。


以 `midway-core.log` 为例，应用启动时会生成一个带当日时间戳 `midway-core.YYYY-MM-DD` 格式的文件，以及一个不带时间戳的 `midway-core.log` 的软链文件。


为方便配置日志采集和查看，该软链文件永远指向最新的日志文件。


当凌晨 `00:00` 时，会生成一个以当天日志结尾 `midway-core.log.YYYY-MM-DD` 的形式的新文件。


同时，当单个日志文件超过 200M 时，也会自动切割，产生新的日志文件。


## 日志标签（label）


日志标签（label）指的是日志输出时，带有 `[xx]` 的部分。


### 默认的日志标签


默认情况下，Midway 对 `coreLogger` 的标签做了特殊处理，使用 `coreLogger` 输出的日志，会自带当前的框架信息。


比如：
```
2021-01-22 12:34:24,354 INFO 34458 [midway:gRPC] Find 1 class has gRPC provider decorator
2021-01-22 12:34:24,372 INFO 34458 [midway:gRPC] Proto helloworld.Greeter found and add to gRPC server
2021-01-22 12:34:24,381 INFO 34458 [midway:gRPC] Server port = 6565 start success
2021-01-22 12:34:24,416 INFO 34458 [midway:gRPC] Server shutdown success
```


Midway 没有对 `appLogger` 做特殊处理，即输出的日志不带标签。


Midway 对 `contextLogger` 做了特殊处理，默认的标签会关联上下文信息。


比如在 Web 下，会输出 ip，method，path 等：
```
2021-01-20 15:13:25,408 INFO 66376 [-/127.0.0.1/-/5ms GET /] xxxx
```


### 修改日志标签


有两个地方可以修改日志标签。


**1、初始化时**
```typescript
const logger = this.app.createLogger('custom', {					// 创建了一个日志等级为 level，只输出到终端的日志
  level: 'info',
  defaultLabel: 'main label',
});

logger.info('hello world');

// output => 2021-01-20 15:13:25,408 INFO 66376 [main label] hello world
```


**2、动态调整**
```typescript
const logger = this.app.createLogger('custom', {					// 创建了一个日志等级为 level，只输出到终端的日志
  level: 'info',
});

// 可以传递一个字符串
logger.info('hello world', {label: 'UserService'});

// output => 2021-01-20 15:13:25,408 INFO 66376 [UserService] hello world

// 也可以传递数组，会使用:进行组合
logger.info('hello world', { label: ['a', 'b']});

// output => 2021-01-20 15:13:25,408 INFO 66376 [a:b] hello world
```
:::info
注意，动态调整标签，不会影响默认的标签，即下一次如果不带 {label: xxx}，依旧会输出默认标签。
:::


## 自定义日志


如果用户不满足于默认的日志对象，也可以自行创建。


创建日志有两种方法：


- 1、从 app/framework 创建
- 2、从日志库 `@midwayjs/logger` 创建



不管哪一种，都是代理自日志容器的 `createLogger` 方法。


### 日志容器


日志容器是来存放日志对象以及管理日志对象，你可以理解为一个 Map。key 为日志对象的名称，value 为日志对象本身。


默认情况下，引入 `@midwayjs/logger` 库时，会在全局创建一个日志容器。
```typescript
import { loggers } from '@midwayjs/logger';

console.log(loggers);			// 当前全局默认的日志容器
```
所有通过框架以及自定义创建的日志对象，都会存储其中。


每次使用 `@Logger` 装饰器以及 `app.getLogger()` 获取日志的行为，本质上都是从默认的日志容器或获取同名的日志对象。
```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {
  
  @App()
  app: IMidwayApplication;
  
  @Logger()
  logger;														// 即 loggers.getLogger('logger')

  async getUser() {
    // 即 loggers.getLogger('coreLogger')
    this.app.getLogger('coreLogger').warn('warn message');
  }

}
```
除了 `getLogger` 之外，还有其他一些方法，这些最基础的方法，可以以最原始的方式来获取、修改日志对象。


```typescript
import { loggers, ILogger } from '@midwayjs/logger';

const customLogger = loggers.createLogger('customLogger', {
	// ...
});

customLogger.info('hello world');

loggers.getLogger('customLogger');										// 从容器获取一个日志
loggers.addLogger('anotherLogger', customLogger);			// 添加一个新的日志
loggers.removeLogger('customLogger');									// 移除一个日志
loggers.close();																			// 关闭并移除所有日志
```
**这种方法是一般用于和框架无关的场景**，需要传递相对完整的参数，比如日志文件的路径等。


同时， `@midway/logger` 也提供两个简化的方法，用于快速创建日志。
```typescript
import { createLogger, createConsoleLogger } from '@midwayjs/logger';

// 一个只有控制台输出的日志，并添加到默认的日志容器中
const consoleLogger = createConsoleLogger('customConsoleLogger');

// 一个只写文本的日志，并添加到默认的日志容器中（不会将错误转到其他日志，也不会输出控制台）
const onlyFileLogger = createFileLogger('customOnlyFileConsoleLogger', {
  dir: logsDir,
  fileLogName: 'test-logger.log',
});

// 文本日志，并添加到默认的日志容器中
const fileLogger = createLogger('customFileLogger', {
  level: 'warn',
	dir: __dirname,
});

```


注意，如果创建同名的日志，日志容器会自动判断重名，跳过创建，并返回原有日志对象。
```typescript
const customLogger1 = loggers.createLogger('customLogger', {
	// ...
});

const customLogger2 = loggers.createLogger('customLogger', {
	// ...
});

// customLogger1 === customLogger2
```
:::info
这个特性很有用，使得在不同场景下，能够让业务使用到同一个日志对象。
:::


### 从当前框架、App 创建日志


在大多数请下，用户会使用这种方式创建日志。


Midway 在 `app`  上增加了 `createLogger` 方法，以方便用户快速基于框架默认的日志配置创建自己的日志实例。


比如在入口的 `configuration.ts` 中，我们可以创建出自己的日志。
```typescript
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;
  
	async onReady() {
    this.app.createLogger('custom1');						// 创建一个全功能的自定义日志
    
    this.app.createLogger('custom2', {					// 创建了一个日志等级为 level，只输出到终端的日志
    	level: 'error',
      disableFile: true,
      disableError: true,
    });
    
    this.app.createLogger('custom3', {
    	fileLevel: 'warn',												// 只修改文件日志等级
      disableConsole: true,											// 禁止终端输出
    });
  }
}
```
这样创建出日志会**自动绑定到框架**中，并且使用框架默认的路径创建日志，后期可以直接根据日志名获取使用。
```typescript
import { ILogger } from '@midwayjs/logger';

export class UserService {
  @Logger('custom1')
  custom1Logger: ILogger;
  
  @Logger('custom2')
  custom2Logger: ILogger;
  
  @Logger('custom3')
  custom3Logger: ILogger;
}
```
:::info
所有创建的日志，在全局日志容器 `loggers` 中都能获取到。
:::


创建日志，等价于在全局日志容器中调用 `loggers.createLogger()` 方法。


### 创建日志选项


`createLogger`  方法的所有参数如下，用户可以自行调整。
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
| message | 普通消息 + 错误消息 + 错误堆栈的组合 | 1、普通文本，如 `123456` ， `hello world`
2、错误文本（错误名+堆栈）Error: another test error at Object.anonymous (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18)
3、普通文本+错误文本 hello world Error: another test error at Object.anonymous (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18) |
| stack | 错误堆栈 |  Error: another test error
    at Object.anonymous (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18) |
| originError | 原始错误对象 | 错误实例本身 |
| originArgs | 原始的用户入参 | [ 'a', 'b', 'c' ] |



示例，创建一个自定义格式的 Logger。


```typescript
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;
  
	async onReady() {
    this.app.createLogger('custom1', {
    	printFormat: (info) => {
      	return `${info.timestamp} ${info.level} ${info.message}`;
      }
    });
    
    this.app.getLogger('custom1').info('hello world');
  }
}
```
这样该日志的输出效果则为：
```typescript
2020-12-30 07:50:10,453 info hello world
```


### 动态修改默认显示内容（TransformableInfoInfo）


在某些场景下，我们无法在初始化修改日志对象 ，如果希望可以修改输出内容，也可以使用动态修改 info 对象的值来达到类似的效果。


```typescript
logger.updateTransformableInfo((info) => {
  info.timestamp = '123';
  return info;
})
```
在原有输出的时间字段的位置则会变成
```typescript
123,408 INFO 66376 [-/127.0.0.1/-/5ms GET /] xxxx
```


:::info
注意，该方法只能修改属性值，但是不能修改输出结构。
:::


### 完全自定义格式（Format）


一般来说修改展示的效果已经足够，在 winston 中，还有另一种完全自定义输出的方式，修改 [logform](https://github.com/winstonjs/logform)。通过修改 logform，基本上可以达到任意的效果。


你可以使用如下的 winston 自带的 format。


[Formats](https://github.com/winstonjs/logform#formats)

- [Align](https://github.com/winstonjs/logform#align)
- [CLI](https://github.com/winstonjs/logform#cli)
- [Colorize](https://github.com/winstonjs/logform#colorize)
- [Combine](https://github.com/winstonjs/logform#combine)
- [Errors](https://github.com/winstonjs/logform#errors)
- [JSON](https://github.com/winstonjs/logform#json)
- [Label](https://github.com/winstonjs/logform#label)
- [Logstash](https://github.com/winstonjs/logform#logstash)
- [Metadata](https://github.com/winstonjs/logform#metadata)
- [PadLevels](https://github.com/winstonjs/logform#padlevels)
- [PrettyPrint](https://github.com/winstonjs/logform#prettyprint)
- [Printf](https://github.com/winstonjs/logform#printf)
- [Simple](https://github.com/winstonjs/logform#simple)
- [Splat](https://github.com/winstonjs/logform#splat)
- [Timestamp](https://github.com/winstonjs/logform#timestamp)
- [Uncolorize](https://github.com/winstonjs/logform#uncolorize)



以及，midway 为 winston 定制的几个 format。


**1、displayCommonMessage**


displayCommonMessage 用于对常用输入的规则化处理，做了以下一些事情


- 1、对数组，Set，Map 的输出处理
- 2、Error 的堆栈拼装，以及增加原始的 error 对象
- 3、增加 pid
- 4、增加大写的 level



它的 options 如下：



| **属性名** | **类型** | **描述** |
| --- | --- | --- |
| defaultMeta | object | 默认输出的元信息，对象 key/value 结构 |
| uppercaseLevel | boolean | 是否开启大写，默认 true |



**2、displayLabels**


按照一定的分隔符聚合标签（labels），它的 options 如下：



| **属性名** | **类型** | **描述** |
| --- | --- | --- |
| defaultLabels | string[] | 标签信息数组 |
| labelSplit | string | 标签分隔符，默认为 : |



示例：
```typescript
import { format, displayCommonMessage, displayLabels } from '@midwayjs/logger';

export class AutoConfiguration {

  @App()
  app: IMidwayApplication;
  
	async onReady() {
    this.app.createLogger('custom1', {
    	format: format.combine(
        displayCommonMessage({
          uppercaseLevel: true,
          defaultMeta: {
          	group: 'defaultGroup'
          },
        }),
        displayLabels({
          defaultLabels: this.labels,
        }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss,SSS',
        }),
        format.splat(),
        format.printf(
         	info =>
                `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}- ${info.group} ${info.message}`
        )
      ),
    });
    
    this.app.getLogger('custom1').info('hello world');
  }
}
```


### 清理全局日志容器


midway 提供了一个方法用于一次性清理所有的日志对象。
```typescript
import { clearAllLoggers } from '@midwayjs/logger';

clearAllLoggers();										// 从默认日志容器中清理所有的日志对象
loggers.getLogger('coreLogger');			// undefined
```


## 配置框架日志


Midway 在框架中提供了默认日志，如果需要修改默认日志的行为，可以在初始化框架时修改，传入不同的日志对象。


### 覆盖框架日志


框架的初始化入口一般为下面的代码，在其中创建日志实例，替换即可。
```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
import { Framework } from '@midwayjs/koa';
import { createLogger, createConsoleLogger } from '@midwayjs/logger';

// 一个只有控制台输出的日志
const consoleLogger = createConsoleLogger('customConsoleLogger');
// 文本日志
const fileLogger = createLogger('customFileLogger', {
	dir: __dirname,
});

const koaFramework = new Framework().configure({
  port: 7001,
  logger: consoleLogger	// or fileLogger
})

Bootstrap
  .load(koaFramework)
  .run();
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


## @midwayjs/web（EggJS）下特殊情况


:::info
在 2021-01-28 之前的创建的项目，默认使用 egg-logger，之后创建的项目，将使用 @mdwayjs/logger。
:::


### 兼容配置


由于 Egg 下原日志配置是非 API 形式，统一放在 config 文件中，在这一场景下，我们依旧支持大部分的参数，用于快速将应用迁移到新的日志体系。


以下配置只在 Egg 下生效。


**config.logger**

| dir | 日志根目录 |
| --- | --- |
| level | 文本日志等级 |
| consoleLevel | 控制台日志等级 |
| errorLogName | 错误日志文件名 |
| coreLogName | core 日志文件名 |
| agentLogName | agent 日志名 |
| appLogName | 应用日志名 |
| disableConsoleAfterReady | ready 之后禁止控制台输出 |



**config.customLogger**

| dir | 日志根目录 |
| --- | --- |
| file | 日志文件名 |
| level | 文本日志等级 |
| consoleLevel | 控制台日志等级 |



### 替换日志库


默认情况下，脚手架生成的日志库为 `@midwayjs/logger` ，并且默认关闭 egg 的日志切割能力（因为 midway 的日志库自带了），如果希望继续使用 `egg-logger` ，可以通过配置改回。
```typescript
// src/config.default.ts
export const midwayFeature = {
  // true 代表 使用 midway logger
  // false 或者为空代表使用 egg-logger
  replaceEggLogger: false      
}
```
同时，由于 egg-logger 日志需要额外开启切割能力，需要开启切割插件。
```typescript
// src/config/plugin.ts
import { EggPlugin } from 'egg';
export default {
  logrotator: true,  // 这行改成 true，或者删掉
  static: false,
} as EggPlugin;

```




### 调整默认 level


```typescript
// config.local.ts
export const logger = {
  level: 'INFO',
  consoleLevel: 'WARN'
}
```


**启动输出**


开发时，框架的默认输出都使用的是 `coreLogger` ，egg 默认的  `coreLogger`  的 `consoleLevel`  为 `WARN` ，如有查看的需求，可以覆盖默认的 egg 配置。
```typescript
// config.local.ts
export const logger = {
  coreLogger: {
    consoleLevel: 'INFO'
  }
}
```

