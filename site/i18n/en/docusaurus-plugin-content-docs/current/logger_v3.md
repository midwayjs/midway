# Logger

Midway provides a unified log access method for different scenarios. Through the `@midwayjs/logger` package export method, you can easily access the logging system in different scenarios.

The functions implemented are:

- Log classification
- Automatic cutting by size and time
- Custom output format
- Unified error log

:::tip

The current version of the log SDK documentation is 3.0. If you need version 2.0, please check [this document](/docs/logger).

:::



## Upgrade from 2.0 to 3.0

Starting from midway v3.13.0, the 3.0 version of `@midwayjs/logger` is supported.

Upgrade the dependency versions in `package.json`, pay attention to the `dependencies` dependencies.

```diff
{
   "dependencies": {
- 		"@midwayjs/logger": "2.0.0",
+ 		"@midwayjs/logger": "^3.0.0"
   }
}
```

If there is no type hint for midwayLogger in the configuration, you need to add a reference to the log library in `src/interface.ts`.

```diff
// src/interface.ts
+ import type {} from '@midwayjs/logger';
```

In most scenarios, the two versions are compatible, but since it is a major version upgrade, there will definitely be some differences. For the complete Breaking Change, please view the [Change Document](https://github.com/midwayjs /logger/blob/main/BREAKING-3.md).



## Logger path and file

Midway will create some default files in the log root directory.


- `midway-core.log` is the log of information printed by the framework and components, corresponding to `coreLogger`.
- `midway-app.log` is the log of application printing information, corresponding to `appLogger`. In `@midawyjs/web`, the file is `midway-web.log`
- `common-error.log` All error logs (all logs created by Midway will repeatedly print errors to this file)

The **log path** and **log level** are different between local development and server deployment. For details, please refer to [Configuration log root directory](#Configuration log root directory) and [Framework’s default level](#Framework’s default grade).



##Default log object

Midway provides three different logs in the framework by default, corresponding to three different behaviors.

| Log                                            | Definition                      | Description                                                  | Common Usage                                                 |
| ---------------------------------------------- | ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| coreLogger                                     | Framework, component level logs | Console logs and text logs `midway-core.log` will be output by default, and error logs will be sent to `common-error.log` by default. | Errors in frameworks and components are generally printed to it. |
| appLogger                                      | Business-level logs             | Console logs and text logs `midway-app.log` will be output by default, and error logs will be sent to `common-error.log` by default, in `@midawyjs/web`, The file is `midway-web.log`. | Log used by business, generally business logs will be printed into it. |
| Context logger (reuse appLogger configuration) | Request link log                | By default, `appLogger` is used for output. In addition to sending the error log to `common-error.log`, context information is also added. | Different protocols have different request log formats. For example, routing information will be output under HTTP. |



## Usage logger

Common log usage methods for Midway.

### Context logger

The context log is a log associated with the framework context object (Context).

We can use the `ctx.logger` object to print logs after [obtaining the ctx object](./req_res_app).

for example:

```typescript
ctx.logger.info("hello world");
ctx.logger.debug('debug info');
ctx.logger.warn('WARNNING!!!!');

// Error logging will directly record the complete stack information of the error log and output it to errorLog.
// In order to ensure that exceptions are traceable, it must be ensured that all thrown exceptions are of type Error, because only type Error will bring stack information and locate the problem.
ctx.logger.error(new Error('custom error'));
```

After execution, we can see log output in two places:


- The console sees the output.
- midway-app.log file in the log directory


Output result:

```text
2021-07-22 14:50:59,388 INFO 7739 [-/::ffff:127.0.0.1/-/0ms GET /api/get_user] hello world
```

In the form of injection, we can also directly use the form of `@Inject() logger` to inject `ctx.logger`, which is equivalent to directly calling `ctx.logger`.

for example:

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



### App Logger

If we want to do some application-level logging, such as recording some data information during the startup phase, we can do it through App Logger.

```typescript
import { Configuration, Logger } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';

@Configuration()
export class MainConfiguration implements ILifeCycle {

   @Logger()
   logger: ILogger;

   async onReady(container: IMidwayContainer): Promise<void> {
     this.logger.debug('debug info');
     this.logger.info('Startup took %d ms', Date.now() - start);
     this.logger.warn('warning!');

     this.logger.error(someErrorObj);
   }

}
```

Note that the `@Logger()` decorator is used here.



### CoreLogger

In component or framework level development, we will use coreLogger to record logs.

```typescript
@Configuration()
export class MainConfiguration implements ILifeCycle {

   @Logger('coreLogger')
   logger: ILogger;

   async onReady(container: IMidwayContainer): Promise<void> {
     this.logger.debug('debug info');
     this.logger.info('Startup took %d ms', Date.now() - start);
     this.logger.warn('warning!');

     this.logger.error(someErrorObj);
   }

}
```




## Output method and format


Midway's log object provides five methods: `error()`, `warn()`, `info()`, `debug()`, and `write()`.


Examples are as follows.

```typescript
logger.debug('debug info');
logger.info('Startup takes %d ms', Date.now() - start);
logger.warn('warning!');
logger.error(new Error('my error'));
logger.write('abcdef');
```

:::tip

The `write` method is used to output the user's original format log.

:::



Formatting method based on `util.format`.

```typescript
logger.info('%s %d', 'aaa', 222);
```

Commonly used ones include


- `%s` string placeholder
- `%d` digital placeholder
- `%j` json placeholder

For more placeholders and details, please refer to the [util.format](https://nodejs.org/dist/latest-v14.x/docs/api/util.html#util_util_format_format_args) method of node.js.



## Logger type definition


In most cases, users should use the simplest `ILogger` definition in `@midwayjs/core`.

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

The `ILogger` definition only provides the simplest `debug`, `info`, `warn` and `error` methods.


In some scenarios, we need more complex definitions. In this case, we need to use the `ILogger` definition provided by `@midwayjs/logger`.


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

`ILogger`The definition can refer to the description in interface, or view [code](https://github.com/midwayjs/logger/blob/main/src/interface.ts).



## Logger configuration



### Basic configuration structure

We can configure various log behaviors in the configuration file.

The log configuration in Midway includes two parts: **global configuration** and **individual log configuration**. The two configurations will be merged and overwritten.

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

As mentioned above, each object in the `clients` configuration section is an independent log configuration item, and its configuration will be merged with the `default` section to create a logger instance.



### Default Transport

In logger module, four Transports `console`, `file`, `error` and `json` are built-in by default. Among them, Midway enables `console`, `file` and `error` by default. More information can be configured through to modify.

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
   midwayLogger: {
     default: {
       transports: {
         console: {
           // console transport configuration
         },
         file: {
           // file transport configuration
         },
         error: {
           // error transport configuration
         },
       }
     },
     // ...
   },
} as MidwayConfig;
```

If a transport is not required, it can be set to `false`.

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



### Configure log level

In Midway, under normal circumstances, we only use four levels: `error`, `warn`, `info`, and `debug`.

The log level indicates the lowest level that can currently output logs. For example, when your log level is set to `warn`, only `warn` and higher `error` level logs can be output.


Midway has its own default log level.


- In the development environment (local, test, unittest), the text and console log levels are unified to `info`.
- In a server environment, in order to reduce the number of logs, the log level of `coreLogger` is `warn`, while other logs are `info`.

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



The level of the logger and the level of the Transport can be set separately. The level of the Transport has a higher priority than the level of the logger.

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
   midwayLogger: {
     default: {
       // level of logger
       level: 'info',
       transports: {
         file: {
           //level of file transport
           level: 'warn'
         }
       }
     },
     // ...
   },
} as MidwayConfig;
```



We can also adjust the log level of a specific logger, such as:

Adjust `coreLogger` or `appLogger`.

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

In special scenarios, the global log level can also be temporarily adjusted.

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



### Configure log root directory

By default, Midway will output logs to the **log root** during local development and server deployment.


- The local log root directory is under the `${app.appDir}/logs/project name` directory
- The server's log root directory is under the user directory `${process.env.HOME}/logs/project name` (Linux/Mac) and `${process.env.USERPROFILE}/logs/project name` (Windows), For example `/home/admin/logs/example-app`.

We can configure the root directory where the log is located. Note that all Transport paths must be modified.

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



### Configure log cutting (rotation)


Under the default behavior, the same log object **will generate two files**.

Taking `midway-core.log` as an example, when the application starts, it will generate a file in the format of `midway-core.YYYY-MM-DD` with a timestamp of the day, and a `midway-core.log` without a timestamp. soft link file.

> Soft links will not be generated under windows


To facilitate the configuration of log collection and viewing, the soft link file always points to the latest log file.


When `00:00` is reached in the morning, a new file will be generated in the form of `midway-core.log.YYYY-MM-DD` ending with the current day's log.

At the same time, when a single log file exceeds 200M, it will be automatically cut and a new log file will be generated.

Cutting by size behavior can be adjusted through configuration.

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



### Configure log cleaning

By default, logs exist for 7 days.

This behavior can be adjusted through configuration, such as saving for 3 days instead.

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

You can also configure a number to indicate the maximum number of log files to retain.

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

### Configure custom logs

It can be configured as follows:

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

Customized logs can be obtained through `@Logger('abcLogger')`.

For more logging options, please refer to [LoggerOptions Description](https://github.com/midwayjs/logger/blob/main/src/interface.ts) in interface.



### Configure log output format


The display format refers to the string structure of a single line of text when outputting logs. 

Each logger object can be configured with an output format. The display format is a method that returns a string structure, and the parameter is an info object.

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

The default properties of the info object are as follows:

| **Attribute name** | **Description**                                              | **Example**             |
| ------------------ | ------------------------------------------------------------ | ----------------------- |
| timestamp          | Timestamp, default is `'YYYY-MM-DD HH:mm:ss,SSS` format.     | 2020-12-30 07:50:10,453 |
| level              | Lowercase log level                                          | info                    |
| LEVEL              | uppercase log level                                          | INFO                    |
| pid                | current process pid                                          | 3847                    |
| message            | result of util.format                                        |                         |
| args               | Original user input parameters                               | [ 'a', 'b', 'c' ]       |
| ctx                | Context object associated when using ContextLogger           |                         |
| originError        | Original error object, obtained after traversing parameters, poor performance | error instance itself   |
| originArgs         | Same as args, only compatible with older versions            |                         |





### Get custom context log

Context log is logged based on **original log object** and will reuse all formats of the original log. Their relationship is as follows.

```typescript
// pseudocode
const contextLogger = customLogger.createContextLogger(ctx);
```

`@Inject` can only inject the default context log. We can obtain the **context log** corresponding to other **custom log** through the `ctx.getLogger` method. The context log is associated with ctx. The same context and the same key will obtain the same log object. When ctx is destroyed, the log object will also be recycled.

```typescript
import { Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Provide()
export class UserService {

   @Inject()
   ctx: Context;

   async getUser() {
     // What is obtained here is the context log object corresponding to customLogger
     const customLogger = this.ctx.getLogger('customLogger');
     customLogger.info('hello world');
   }

}
```




### Configure context log output format

The context log is based on the **original log object** and will reuse all the formats of the original log, but we can separately configure the corresponding context log format of the log object.

There is an additional ctx object in the info object of the context log. Let's take modifying the context log of `customLogger` as an example.

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

Then when you use context log output, it will become your format by default.

```typescript
ctx.getLogger('customLogger').info('hello world');
// 2021-01-28 11:10:19,334 INFO 9223 [2ms POST] hello world
```

Note that since `App Logger` is the default log object of all frameworks and is quite special, some existing frameworks configure its context format by default, causing the configuration in the `midwayLogger` field to be invalid.

To do this, you need to modify the context log format configuration of a certain framework separately. Please jump to a different framework to view it.

- [Modify koa's context log format](./extensions/koa#Modify context log)
- [Modify egg's context log format](./extensions/egg#Modify context log)
- [Modify the context log format of express](./extensions/express#Modify the context log)



### Configure delayed initialization

The log can be initialized lazily using the `lazyLoad` configuration.

for example:

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

`customLoggerA` will be initialized immediately when the framework starts, while `customLoggerB` will be initialized when the business actually uses `getLogger` or `@Logger` injection for the first time.

This function is very suitable for scenarios where logs are dynamically created, but the configurations are expected to be merged together.



### Configure associated logs

The log object can be configured with an associated log object name.

for example:

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

When using the API to retrieve, the same log object will be retrieved with different names.

```typescript
app.getLogger('customLoggerA') => customLoggerA
app.getLogger('customLoggerB') => customLoggerA
```



### Configure console output color

When outputting to the console, if the command line supports color output, different colors will be output for different log levels. If color is not supported, it will not be displayed.

You can turn off color output directly through configuration.

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



### Configure JSON output

By enabling the `json` Transport, the logs can be output in JSON format.

For example, all loggers are turned on.

```typescript
export default {
   midwayLogger: {
     default: {
       transports: {
         json: {
           // ...
         }
       }
     }
     // ...
   },
} as MidwayConfig;
```

Or a single logger is enabled.

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

The configuration format of `json` Transport is the same as `file`, but the output is slightly different.

For example, we can modify the output content in `format`. By default, the output will contain at least the `level` and `pid` fields.

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

The output is:

```text
{"data":"custom data","level":"info","pid":89925}
{"data":"custom data","level":"debug","pid":89925}
```



## Custom Transport

The framework provides the function of extending Transport. For example, you can write a Transport to transfer logs and upload them to other log libraries.



### Inherit existing Transport

If writing to a new file, this can be achieved by using `FileTransport`.

```typescript
import { FileTransport, isEnableLevel, LoggerLevel, LogMeta } from '@midwayjs/logger';

// Transport configuration
interface CustomOptions {
   // ...
}

class CustomTransport extends FileTransport {
   log(level: LoggerLevel | false, meta: LogMeta, ...args) {
     // Determine whether level satisfies the current Transport
     if (!isEnableLevel(level, this.options.level)) {
       return;
     }
    
     // Format the message using built-in formatting methods
     let buf = this.format(level, meta, args) as string;
     //Add newline character
     buf += this.options.eol;

     //Write the log you want to write
     if (this.options.bufferWrite) {
       this.bufSize += buf.length;
       this.buf.push(buf);
       if (this.buf.length > this.options.bufferMaxLength) {
         this.flush();
       }
     } else {
       // If caching is not enabled, write directly
       this.logStream.write(buf);
     }
   }
}
```

Before use, it needs to be registered in the log library.

```typescript
import { TransportManager } from '@midwayjs/logger';

TransportManager.set('custom', CustomTransport);
```

You can then use this Transport in your configuration.

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

In this way, the original logger will automatically execute the Transport when printing logs.



### Fully customized Transport

In addition to writing files, logs can also be delivered to remote services. For example, in the following example, the logs are forwarded to another service.

Note that Transport is an operation that can be executed asynchronously, but the logger itself will not wait for Transport to execute and return.

```typescript
import { Transport, ITransport, LoggerLevel, LogMeta } from '@midwayjs/logger';


// Transport configuration
interface CustomOptions {
   // ...
}

class CustomTransport extends Transport<CustomOptions> implements ITransport {
   log(level: LoggerLevel | false, meta: LogMeta, ...args) {
     // Format the message using built-in formatting methods
     let msg = this.format(level, meta, args) as string;
  
     //Asynchronously write to the log library
     remoteSdk.send(msg).catch(err => {
       // Log the error or ignore it
       console.error(err);
     });
   }
}
```



## Dynamic API

Dynamically obtain the log object through the `getLogger` method.

```typescript
// Get coreLogger
const coreLogger = app.getLogger('coreLogger');
// Get the default contextLogger
const contextLogger = ctx.getLogger();
// Get the contextLogger created by a specific logger, equivalent to customALogger.createContextLogger(ctx)
const customAContextLogger = ctx.getLogger('customA');
```

The framework's built-in `MidwayLoggerService` also has the above API.

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
    
     //Create context logger
     const customContextLogger = this.loggerService.createContextLogger(this.ctx, customLogger);
   }
}
```



## Common Problem



### 1. The server environment log is not output

We do not recommend printing too many logs in the server environment. Only print necessary content. Excessive log output affects performance and quickly locates problems.

To adjust the log level, see the "Configuring Log Level" section.



### 2. The server has no console log

Generally speaking, the server console log (console) is closed and will only be output to a file. If there are special needs, it can be adjusted individually.



### 3. Some Docker environments fail to start

Check whether the user who started the current application in the directory where the log is written has permissions.



### 4. How to convert if there is an old configuration?

The new version of the log library is already compatible with the old configuration. Generally, no additional processing is required. There is a priority relationship between the old configuration and the new configuration when merging. Please check the [Change Document](https://github.com/midwayjs/logger/blob/ main/BREAKING-3.md).

In order to reduce troubleshooting problems, please use the new configuration format when using the new version of the log library.
