# 日志

Midway 为不同场景提供了一套统一的日志接入方式。通过 `@midwayjs/logger` 包导出的方法，可以方便的接入不同场景的日志系统。

实现的功能有：

- 日志分级
- 按大小和时间自动切割
- 自定义输出格式
- 统一错误日志

:::tip

当前版本为 3.0 的日志 SDK 文档，如需 2.0 版本，请查看 [这个文档](/docs/logger)。

:::



## 从 2.0 升级到 3.0

从 midway v3.13.0 开始，支持使用 3.0 版本的 `@midwayjs/logger`。

将 `package.json` 中的依赖版本升级，注意是 `dependencies` 依赖。

```diff
{
  "dependencies": {
-    "@midwayjs/logger": "2.0.0",
+    "@midwayjs/logger": "^3.0.0"
  }
}
```

如果在配置中没有了 midwayLogger 的类型提示，你需要在 `src/interface.ts` 中加入日志库的引用。

```diff
// src/interface.ts
+ import type {} from '@midwayjs/logger';
```

在大部分场景下，两个版本是兼容的，但是由于是大版本升级，肯定会有一定的差异性，完整的 Breaking Change 变化，请查看 [变更文档](https://github.com/midwayjs/logger/blob/main/BREAKING-3.md)。



## 日志路径和文件

Midway 会在日志根目录创建一些默认的文件。


- `midway-core.log` 框架、组件打印信息的日志，对应 `coreLogger` 。
- `midway-app.log` 应用打印信息的日志，对应 `appLogger`，在 `@midawyjs/web` 中，该文件是 `midway-web.log`
- `common-error.log` 所有错误的日志（所有 Midway 创建出来的日志，都会将错误重复打印一份到该文件中）

本地开发和服务器部署时的 **日志路径** 和 **日志等级** 不同，具体请参考 [配置日志根目录](#配置日志根目录) 和 [框架的默认等级](#框架的默认等级)。



## 默认日志对象

Midway 默认在框架提供了三种不同的日志，对应三种不同的行为。

| 日志                                | 释义                 | 描述                                                         | 常见使用                                                     |
| ----------------------------------- | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| coreLogger                          | 框架，组件层面的日志 | 默认会输出控制台日志和文本日志 `midway-core.log` ，并且默认会将错误日志发送到 `common-error.log` 。 | 框架和组件的错误，一般会打印到其中。                         |
| appLogger                           | 业务层面的日志       | 默认会输出控制台日志和文本日志 `midway-app.log` ，并且默认会将错误日志发送到 `common-error.log` ，在 `@midawyjs/web` 中，该文件是 `midway-web.log`。 | 业务使用的日志，一般业务日志会打印到其中。                   |
| 上下文日志（复用 appLogger 的配置） | 请求链路的日志       | 默认使用 `appLogger` 进行输出，除了会将错误日志发送到 `common-error.log` 之外，还增加了上下文信息。 | 不同的协议有不同的请求日志格式，比如 HTTP 下就会输出路由信息。 |



## 使用日志

Midway 的常用日志使用方法。

### 上下文日志

上下文日志是关联框架上下文对象（Context） 的日志。

我们可以通过 [获取到 ctx 对象](./req_res_app) 后，使用 `ctx.logger` 对象进行日志打印输出。

比如：

```typescript
ctx.logger.info("hello world");
ctx.logger.debug('debug info');
ctx.logger.warn('WARNNING!!!!');

// 错误日志记录，直接会将错误日志完整堆栈信息记录下来，并且输出到 errorLog 中
// 为了保证异常可追踪，必须保证所有抛出的异常都是 Error 类型，因为只有 Error 类型才会带上堆栈信息，定位到问题。
ctx.logger.error(new Error('custom error'));
```

在执行后，我们能在两个地方看到日志输出：


- 控制台看到输出。
- 日志目录的 midway-app.log 文件中


输出结果：
```text
2021-07-22 14:50:59,388 INFO 7739 [-/::ffff:127.0.0.1/-/0ms GET /api/get_user] hello world
```

在注入的形式中，我们也可以直接使用 `@Inject() logger` 的形式来注入 `ctx.logger` ，和直接调用 `ctx.logger` 等价。

比如：

```typescript
import { Get, Inject, Controller, Provide } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';

@Controller()
export class HelloController {

  @Inject()
  logger: ILogger;

  @Inject()
  ctx;

  @Get("/")
  async hello(){
    // ...

    // this.logger === ctx.logger
  }
}
```



### 应用日志（App Logger）

如果我们想做一些应用级别的日志记录，如记录启动阶段的一些数据信息，可以通过 App Logger 来完成。

```typescript
import { Configuration, Logger } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';

@Configuration()
export class MainConfiguration implements ILifeCycle {

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



### CoreLogger

在组件或者框架层面的研发中，我们会使用 coreLogger 来记录日志。

```typescript

@Configuration()
export class MainConfiguration implements ILifeCycle {

  @Logger('coreLogger')
  logger: ILogger;

  async onReady(container: IMidwayContainer): Promise<void> {
    this.logger.debug('debug info');
    this.logger.info('启动耗时 %d ms', Date.now() - start);
    this.logger.warn('warning!');

    this.logger.error(someErrorObj);
  }

}
```




## 输出方法和格式


Midway 的日志对象提供 `error()` ， `warn()` ， `info()` , `debug()`，`write()` 五种方法。


示例如下。
```typescript
logger.debug('debug info');
logger.info('启动耗时 %d ms', Date.now() - start);
logger.warn('warning!');
logger.error(new Error('my error'));
logger.write('abcdef');
```

:::tip

`write` 方法用于输出用户的原始格式日志。

:::



基于 `util.format` 的格式化方式。
```typescript
logger.info('%s %d', 'aaa', 222);
```
常用的有


- `%s` 字符串占位
- `%d` 数字占位
- `%j` json 占位

更多的占位和详细信息，请参考 node.js 的 [util.format](https://nodejs.org/dist/latest-v14.x/docs/api/util.html#util_util_format_format_args) 方法。



## 日志类型定义


大部分情况下，用户应该使用 `@midwayjs/core` 中最简单的 `ILogger` 定义。
```typescript
import { Provide, Logger, ILogger } from '@midwayjs/core';

@Provide()
export class UserService {

  @Inject()
  logger: ILogger;

  async getUser() {
  	this.logger.info('hello user');
  }
}
```

`ILogger` 定义只提供最简单的 `debug` ， `info` ， `warn` 以及 `error` 方法。


在某些场景下，我们需要更为复杂的定义，这个时候需要使用 `@midwayjs/logger` 提供的 `ILogger` 定义。


```typescript
import { Provide, Logger } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {

  @Inject()
  logger: ILogger;

  async getUser() {
    // ...
  }

}
```
`ILogger`  的定义可以参考 interface 中的描述，或者查看 [代码](https://github.com/midwayjs/logger/blob/main/src/interface.ts)。



## 日志配置



### 基本配置结构

我们可以在配置文件中配置日志的各种行为。

Midway 中的的日志配置包含 **全局配置** 和 **单个日志配置** 两个部分，两者配置会合并和覆盖。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      // ...
    },
    clients: {
      coreLogger: {
        // ...
      },
      appLogger: {
        // ...
      }
    }
  },
} as MidwayConfig;
```

如上所述，`clients` 配置段中的每个对象都是一个独立的日志配置项，其配置会和 `default` 段落合并后创建 logger 实例。



### 默认 Transport

在日志模块中，默认内置了 `console`，`file`，`error` ，`json` 四个 Transport，其中 Midway 默认启用了  `console`，`file`，`error` ，更多信息可以通过配置进行修改。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      transports: {
        console: {
          // console transport 配置
        },
        file: {
          // file transport 配置
        },
        error: {
          // error transport 配置
        },
      }
    },
    // ...
  },
} as MidwayConfig;
```

如果不需要某个 transport，可以设置为 `false`。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      transports: {
        console: false,
      }
    },
    // ...
  },
} as MidwayConfig;
```



### 配置日志等级

在 Midway 中，一般情况下，我们只会使用 `error` ， `warn` ， `info` ， `debug` 这四种等级。

日志等级表示当前可输出日志的最低等级。比如当你的日志 level 设置为 `warn`  时，仅 `warn` 以及更高的 `error` 等级的日志能被输出。


在 Midway 中，有着自己的默认日志等级。


- 在开发环境下（local，test，unittest），文本和控制台日志等级统一为 `info` 。
- 在服务器环境，为减少日志数量，`coreLogger` 日志等级为 `warn` ，而其他日志为 `info`。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      level: 'info',
    },
    // ...
  },
} as MidwayConfig;
```



logger 的 level 和 Transport 的 level 可以分开设置，Tranport 的 level 优先级高于 logger 的 level。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      // logger 的 level
      level: 'info',
      transports: {
        file: {
          // file transport 的 level
          level: 'warn'
        }
      }
    },
    // ...
  },
} as MidwayConfig;
```



我们也可以调整特定的 logger 的日志等级，比如：

调整 `coreLogger` 或者 `appLogger` 。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    clients: {
      coreLogger: {
        level: 'warn',
        // ...
      },
      appLogger: {
        level: 'warn',
        // ...
      }
    }
  },
} as MidwayConfig;
```

特殊场景，也可以临时调整全局的日志等级。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      level: 'info',
      transports: {
        console: {
          level: 'warn'
        }
      }
    },
    // ...
  },
} as MidwayConfig;
```



### 配置日志根目录

默认情况下，Midway 会在本地开发和服务器部署时输出日志到 **日志根目录**。


- 本地的日志根目录为 `${app.appDir}/logs/项目名` 目录下
- 服务器的日志根目录为用户目录 `${process.env.HOME}/logs/项目名` （Linux/Mac）以及 `${process.env.USERPROFILE}/logs/项目名` （Windows）下，例如 `/home/admin/logs/example-app`。

我们可以配置日志所在的根目录，注意，要将所有 Transport 的路径都修改。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      transports: {
        file: {
          dir: '/home/admin/logs',
        },
        error: {
          dir: '/home/admin/logs',
        },
      }
    },
    // ...
  },
} as MidwayConfig;
```



### 配置日志切割（轮转）


默认行为下，同一个日志对象 **会生成两个文件**。

以 `midway-core.log` 为例，应用启动时会生成一个带当日时间戳 `midway-core.YYYY-MM-DD` 格式的文件，以及一个不带时间戳的 `midway-core.log` 的软链文件。

> windows 下不会生成软链


为方便配置日志采集和查看，该软链文件永远指向最新的日志文件。


当凌晨 `00:00` 时，会生成一个以当天日志结尾 `midway-core.log.YYYY-MM-DD` 的形式的新文件。

同时，当单个日志文件超过 200M 时，也会自动切割，产生新的日志文件。

可以通过配置调整按大小的切割行为。

```typescript
export default {
  midwayLogger: {
    default: {
      transports: {
        file: {
          maxSize: '100m',
        },
        error: {
          maxSize: '100m',
        },
      }
    },
    // ...
  },
} as MidwayConfig;
```



### 配置日志清理

默认情况下，日志会存在 7 天。

可以通过配置调整该行为，比如改为保存 3 天。

```typescript
export default {
  midwayLogger: {
    default: {
      transports: {
        file: {
          maxFiles: '3d',
        },
        error: {
          maxFiles: '3d',
        },
      }
    },
    // ...
  },
} as MidwayConfig;
```

也可以配置数字，表示最多保留日志文件的个数。

```typescript
export default {
  midwayLogger: {
    default: {
      transports: {
        file: {
          maxFiles: '3',
        },
        error: {
          maxFiles: '3d',
        },
      }
    },
    // ...
  },
} as MidwayConfig;
```



### 配置自定义日志

可以如下配置：

```typescript
export default {
  midwayLogger: {
    clients: {
      abcLogger: {
        fileLogName: 'abc.log'
        // ...
      }
    }
    // ...
  },
} as MidwayConfig;
```

自定义的日志可以通过 `@Logger('abcLogger')` 获取。

更多的日志选项可以参考 interface 中 [LoggerOptions 描述](https://github.com/midwayjs/logger/blob/main/src/interface.ts)。



### 配置日志输出格式


显示格式指的是日志输出时单行文本的字符串结构。

每个 logger 对象，都可以配置一个输出格式，显示格式是一个返回字符串结构的方法，参数为一个 info 对象。

```typescript
import { LoggerInfo } from '@midwayjs/logger';

export default {
  midwayLogger: {
    clients: {
      appLogger: {
        format: (info: LoggerInfo) => {
          return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}${info.message}`;
        }
        // ...
      },
      customOtherLogger: {
        format: (info: LoggerInfo) => {
          return 'xxxx';
        }
      }
    }
    // ...
  },
} as MidwayConfig;
```

info 对象的默认属性如下：

| **属性名**  | **描述**                                         | **示例**                |
| ----------- | ------------------------------------------------ | ----------------------- |
| timestamp   | 时间戳，默认为 `'YYYY-MM-DD HH:mm:ss,SSS` 格式。 | 2020-12-30 07:50:10,453 |
| level       | 小写的日志等级                                   | info                    |
| LEVEL       | 大写的日志等级                                   | INFO                    |
| pid         | 当前进程 pid                                     | 3847                    |
| message     | util.format 的结果                               |                         |
| args        | 原始的用户入参                                   | [ 'a', 'b', 'c' ]       |
| ctx         | 使用 ContextLogger 时关联的上下文对象            |                         |
| originError | 原始错误对象，遍历参数后获取，性能较差           | 错误实例本身            |
| originArgs  | 同 args，仅做兼容老版本使用                      |                         |



### 获取自定义上下文日志

上下文日志是基于 **原始日志对象** 来打日志的，会复用原始日志的所有格式，他们的关系如下。

```typescript
// 伪代码
const contextLogger = customLogger.createContextLogger(ctx);
```

`@Inject` 只能注入默认的上下文日志，我们可以通过 `ctx.getLogger` 方法获取其他 **自定义日志** 对应的 **上下文日志**。上下文日志和 ctx 关联，同一个上下文会相同的 key 会获取到同一个日志对象，当 ctx 被销毁，日志对象也会被回收。

```typescript
import { Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Provide()
export class UserService {

  @Inject()
  ctx: Context;

  async getUser() {
    // 这里获取的是 customLogger 对应的上下文日志对象
    const customLogger = this.ctx.getLogger('customLogger');
  	customLogger.info('hello world');
  }

}
```




### 配置上下文日志输出格式

上下文日志是基于 **原始日志对象** 来打日志的，会复用原始日志的所有格式，但是我们可以单独配置日志对象的对应的上下文日志格式。

上下文日志的 info 对象中多了 ctx 对象，我们以修改 `customLogger` 的上下文日志为例。

```typescript
export default {
  midwayLogger: {
    clients: {
      customLogger: {
        contextFormat: info => {
          const ctx = info.ctx;
          return `${info.timestamp} ${info.LEVEL} ${info.pid} [${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
        }
        // ...
      }
    }
    // ...
  },
} as MidwayConfig;
```

则你在使用上下文日志输出时，会默认变成你 format 的样子。

```typescript
ctx.getLogger('customLogger').info('hello world');
// 2021-01-28 11:10:19,334 INFO 9223 [2ms POST] hello world
```

注意，由于 `App Logger` 是所有框架默认的日志对象，较为特殊，现有部分框架默认配置了其上下文格式，导致在 `midwayLogger` 字段中配置无效。

为此你需要单独修改某一框架的上下文日志格式配置，请跳转到不同的框架查看。

-  [修改 koa 的上下文日志格式](./extensions/koa#修改上下文日志)
-  [修改 egg 的上下文日志格式](./extensions/egg#修改上下文日志)
-  [修改 express 的上下文日志格式](./extensions/express#修改上下文日志)



### 配置延迟初始化

可以使用 `lazyLoad` 配置让日志延迟初始化。

比如：

```typescript
export default {
  midwayLogger: {
    clients: {
      customLoggerA: {
        // ..
      },
      customLoggerB: {
        lazyLoad: true,
      },
    }
    // ...
  },
} as MidwayConfig;
```

`customLoggerA` 会在框架启动时立即初始化，而 `customLoggerB` 会在业务实际第一次使用 `getLogger` 或者 `@Logger` 注入时才被初始化。

这个功能非常适合动态化创建日志，但是配置却希望合并到一起的场景。



### 配置关联日志

日志对象可以配置一个关联的日志对象名。

比如：

```typescript
export default {
  midwayLogger: {
    clients: {
      customLoggerA: {
        aliasName: 'customLoggerB',
        // ...
      },
    }
    // ...
  },
} as MidwayConfig;
```

当使用 API 获取时，不同的名字将取到同样的日志对象。

```typescript
app.getLogger('customLoggerA') => customLoggerA
app.getLogger('customLoggerB') => customLoggerA
```



### 配置控制台输出颜色

控制台输出时，在命令行支持颜色输出的情况下，针对不同的的日志等级会输出不同的颜色，如果不支持颜色，则不会显示。

你可以通过配置直接关闭颜色输出。

```typescript
export default {
  midwayLogger: {
    default: {
      transports: {
        console: {
          autoColors: false,
        }
      }
    }
    // ...
  },
} as MidwayConfig;
```



### 配置 JSON 输出

通过开启 `json` Transport，可以将日志输出为 JSON 格式。

比如所有 logger 开启。

```typescript
export default {
  midwayLogger: {
    default: {
      transports: {
        file: false,
        json: {
          fileLogName: 'midway-app.json.log'
        }
      }
    }
    // ...
  },
} as MidwayConfig;
```

或者单个 logger 开启。

```typescript
export default {
  midwayLogger: {
    default: {
      // ...
    },
    clients: {
      appLogger: {
        transports: {
          json: {
            // ...
          }
        }
      }
    }
  },
} as MidwayConfig;
```

`json` Transport 的配置格式和 `file` 相同，输出略有不同。

比如我们可以修改 `format` 中输出的内容，默认情况下，输出至少会包含 `level` 和 `pid` 字段

```typescript
export default {
  midwayLogger: {
    default: {
      transports: {
        json: {
          format: (info: LoggerInfo & {data: string}) => {
            info.data = 'custom data';
            return info;
          }
        }
      }
    }
    // ...
  },
} as MidwayConfig;
```

输出为：

```text
{"data":"custom data","level":"info","pid":89925}
{"data":"custom data","level":"debug","pid":89925}
```



## 自定义 Transport

框架提供了扩展 Transport 的功能，比如，你可以写一个 Transport 来做日志的中转，上传到别的日志库等能力。



### 继承现有 Transport

如果是写入到新的文件，可以通过使用 `FileTransport` 来实现。

```typescript
import { FileTransport, isEnableLevel, LoggerLevel, LogMeta } from '@midwayjs/logger';

// Transport 的配置
interface CustomOptions {
  // ...
}

class CustomTransport extends FileTransport {
  log(level: LoggerLevel | false, meta: LogMeta, ...args) {
    // 判断 level 是否满足当前 Transport
  	if (!isEnableLevel(level, this.options.level)) {
      return;
    }
    
    // 使用内置的格式化方法格式化消息
    let buf = this.format(level, meta, args) as string;
    // 加上换行符
    buf += this.options.eol;

    // 写入自己想写的日志
    if (this.options.bufferWrite) {
      this.bufSize += buf.length;
      this.buf.push(buf);
      if (this.buf.length > this.options.bufferMaxLength) {
        this.flush();
      }
    } else {
      // 没启用缓存，则直接写入
      this.logStream.write(buf);
    }
  }
}
```

在使用前，需要注册到日志库中。

```typescript
import { TransportManager } from '@midwayjs/logger';

TransportManager.set('custom', CustomTransport);
```

之后就可以在配置中使用这个 Transport 了。

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      transports: {
        custom: {
          dir: 'xxxx',
          fileLogName: 'xxx',
          // ...
        }
      }
    }
  },
} as MidwayConfig;
```

这样，原有的 logger 打印日志时，会自动执行该 Transport。



### 完全自定义 Transport

除了写入文件之外，也可以将日志投递到远端服务，比如下面的示例，将日志中转到另一个服务。

注意，Transport 是一个可异步执行的操作，但是 logger 本身不会等待 Transport 执行返回。

```typescript
import { Transport, ITransport, LoggerLevel, LogMeta } from '@midwayjs/logger';


// Transport 的配置
interface CustomOptions {
  // ...
}

class CustomTransport extends Transport<CustomOptions> implements ITransport {
  log(level: LoggerLevel | false, meta: LogMeta, ...args) {
    // 使用内置的格式化方法格式化消息
    let msg = this.format(level, meta, args) as string;
  
    // 异步写入日志库
    remoteSdk.send(msg).catch(err => {
      // 记录下错误或者忽略
      console.error(err);
    });
  }
}
```



## 动态 API

通过 `getLogger` 方法动态获取日志对象。

```typescript
// 获取 coreLogger
const coreLogger = app.getLogger('coreLogger');
// 获取默认的 contextLogger
const contextLogger = ctx.getLogger();
// 获取特定 logger 创建出来的 contextLogger，等价于 customALogger.createContextLogger(ctx)
const customAContextLogger = ctx.getLogger('customA');
```

框架内置的 `MidwayLoggerService` 也拥有上述的 API。

```typescript
import { MidwayLoggerService } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Provide()
export class MainConfiguration {
  
  @Inject()
  loggerService: MidwayLoggerService;
  
  @Inject()
  ctx: Context;
  
  async getUser() {
    // get custom logger
    const customLogger = this.loggerService.getLogger('customLogger');
    
    // 创建 context logger
    const customContextLogger = this.loggerService.createContextLogger(this.ctx, customLogger);
  }
}
```



## 常见问题



### 1、服务器环境日志不输出

我们不推荐在服务器环境打印太多的日志，只打印必须的内容，过多的日志输出影响性能，也影响快速定位问题。

如需调整日志等级，请查看 ”配置日志等级“ 部分。



### 2、服务器没有控制台日志

一般来说，服务器控制台日志（console）是关闭的，只会输出到文件中，如有特殊需求，可以单独调整。



### 3、部分 Docker 环境启动失败

检查日志写入的目录当前应用启动的用户是否有权限。



### 4、如果有老的配置如何转换

新版本日志库已经兼容老配置，一般情况下无需额外处理，老配置和新配置在合并时有优先级关系，请查看 [变更文档](https://github.com/midwayjs/logger/blob/main/BREAKING-3.md)。

为了减少排查问题，在使用新版本日志库时请尽可能使用新配置格式。
