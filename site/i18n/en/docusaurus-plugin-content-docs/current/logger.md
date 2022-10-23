# Log

Midway provides a unified log access method for different scenarios. The `@midwayjs/logger` package export method allows you to easily access log systems in different scenarios.

Midway's log system is based on the [winston](https://github.com/winstonjs/winston) of the community and is now a very popular log library in the community.

The functions realized are:

- Log classification
- Automatic cutting by size and time
- Custom output format
- Unified error log



## Log path and file

Midway creates some default files in the log root directory.


- `midway-core.log` logs of printed information of the framework and components, corresponding to the `coreLogger`.
- `midway-app.log` applies the log of printing information, corresponding to the `appLogger`
- `common-error.log` The log of all errors (all logs created by Midway will repeatedly print errors to this file)

The **Log Path** and **Log Level** of local development and server deployment are different. For more information, see [Configure Log Root](# Configure the log root directory) and [Default Level](# The default level of the framework).



## Default log object

Midway provides three different logs in the framework by default, corresponding to three different behaviors.

| Log | Interpretation | Description | Common use |
| ----------------------------------- | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| coreLogger | Framework, component-level logs | By default, the console log and text log `midway-core.log` are output, and the error log is sent to `common-error.log` by default.  | Frames and component errors are generally printed into them.  |
| appLogger | Logs at the business level | The `midway-app.log` of the console log and text log is output by default, and the error log is sent to `common-error.log` by default.  | The log used by the business. Generally, the business log will be printed in it.  |
| Context Log (Configuration of Multiplexing appLogger) | Log of request link | By default, `appLogger` is used for output. In addition to sending error logs to `common-error.log`, context information is added.  | Modify the label (Label) of log output. Different frameworks have different request labels. For example, under HTTP, routing information will be output. |



## Use log

Midway's common log usage method.

### Context log

The context log is the log associated with the framework context object (Context).

You can [obtain the ctx object](./req_res_app) and then use the `ctx.logger` object to print and output logs.

For example:

```typescript
ctx.logger.info("hello world");
ctx.logger.debug('debug info');
ctx.logger.warn('WARNNING!!!!');

// Error log recording will directly record the complete stack information of the error log and output it to the errorLog
// In order to ensure that exceptions can be traced, all exceptions thrown must be of Error type, because only Error type will bring stack information to locate the problem.
ctx.logger.error(new Error('custom error'));
```

After execution, we can see the log output in two places:


- The console sees the output.
- In the midway-app.log file of the log directory


Output result:
```text
2021-07-22 14:50:59,388 INFO 7739 [-/::ffff:127.0.0.1/-/0ms GET /api/get_user] hello world
```

In the injection form, you can also use `@Inject() logger` to inject `ctx.logger`, which is equivalent to calling `ctx.logger` directly.

For example:

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
  async hello() {
    // ...

    // this.logger === ctx.logger
  }
}
```



### App Logger

If we want to do some application-level logging, such as recording some data information during the startup phase, we can do it through App Logger.

```typescript
import { Configuration, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  @Logger()
  logger: ILogger;

  async onReady(container: IMidwayContainer): Promise<void> {
    this.logger.debug('debug info');
    This.logger.info ('startup takes% d ms', Date.now() - start);
    this.logger.warn('warning!');

    this.logger.error(someErrorObj);
  }

}
```

Note that the `@Logger()` decorator is used here.



### CoreLogger

In research and development at the component or framework level, we will use coreLogger to log.

```typescript

@Configuration()
export class MainConfiguration implements ILifeCycle {

  @Logger('coreLogger')
  logger: ILogger;

  async onReady(container: IMidwayContainer): Promise<void> {
    this.logger.debug('debug info');
    This.logger.info ('startup takes% D MS', Date.now() -Start);
    this.logger.warn('warning!');

    this.logger.error(someErrorObj);
  }

}
```






## Output method and format


The log object of Midway inherits the log object of the winston. In general, only four methods are provided: `error()`, `war ()`, `info()`, and `debug`.


An example is as follows.
```typescript
logger.debug('debug info');
logger.info('startup takes% d ms', Date.now() - start);
logger.warn('warning!');
logger.error(new Error('my error'));
```


### Default output behavior


In most common types, the logstore works well.


For example:
```typescript
logger.info('hello world'); // Output string
logger.info(123); //Output Number
logger.info(['B', 'c']); // Output array
logger.info(new Set([2, 3, 4])); // Output Set
logger.info(new Map([['key1', 'value1'], ['key2', 'value2']])); // Output Map
```
> Midway has specially customized the `Array`, `Set`, and `Map` types that winston cannot output to enable them to output normally.


However, it should be noted that under normal circumstances, the log object can only pass in one parameter, and its second parameter has other functions.
```typescript
logger.info('plain error message', 321); // 321 will be ignored
```


### Error output


For the wrong object, Midway has also customized the winston so that it can be easily combined with ordinary text for output.
```typescript
// Output error object
logger.error(new Error('error instance'));

// Output custom error object
const error = new Error('named error instance');
error.name = 'NamedError';
logger.error(error);

// Text before, plus error instance
logger.info('text before error', new Error('error instance after text'));
```
:::caution
Note that the error object can only be placed at the end, and there is only one, and all parameters after it will be ignored.
:::




### Format content
The format method based on `util.format`.
```typescript
logger.info('%s %d', 'aaa', 222);
```
Commonly used are


- The `%s` string is occupied.
- `%d` digit occupancy
- `%j` json placeholder

For more information, see the [util.format](https://nodejs.org/dist/latest-v14.x/docs/api/util.html#util_util_format_format_args) method of Node. js.



### Output custom objects or complex types


Based on performance considerations, Midway(winston) only outputs basic types most of the time, so when the output parameter is an advanced object, the user **needs to manually convert it to a string** that needs to be printed.


The following example will not get the desired result.
```typescript
const obj = {a: 1};
logger.info(obj); // By default, output [object Object]
```
You need to manually output what you want to print.
```typescript
const obj = {a: 1};
logger.info(JSON.stringify(obj)); // formatted text can be output
logger.info(obj.a); // Direct output attribute value
logger.info('%j', a); // Direct placeholder output entire json
```



### Pure output content


In special scenarios, we need to simply output content, and do not want to output timestamps, labels and other format-related information. For this requirement, we can use the `write` method.

The `write` method is a very low-level method, and no matter what level of logs are written to the file.


Although the `write` method is available on every logger, we only provide it in the `IMidwayLogger` definition, and we hope you can clearly know that you want to call it.
```typescript
(logger as IMidwayLogger).write('hello world'); // There will only be hello world in the file
```



## Log type definition


By default, users should use the simplest `ILogger` definition.
```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserService {

  @Inject()
  logger: ILogger; // Get context log

  async getUser() {
  	this.logger.info('hello user');
  }

}
```


The `ILogger` definition provides only the simplest `debug`, `info`, `WARN`, and `error` methods.


In some scenarios, we need more complex definitions, such as modifying log attributes or dynamically adjusting. At this time, we need to use more complex `IMidwayLogger` definitions.


```typescript
import { Provide, Logger } from '@midwayjs/decorator';
import { IMidwayLogger } from '@midwayjs/logger';

@Provide()
export class UserService {

  @Inject()
  logger: IMidwayLogger; // Get context log

  async getUser() {
    This. Logger. disableConsole(); // Prohibit console output
  	this.logger.info('hello user'); // This sentence is not visible in the console
    This. Logger. enableConsole(); // Turn on console output
    this.logger.info('hello user'); // This sentence can be seen in the console
  }

}
```
The definition of the `IMidwayLogger` can refer to the description in the interface or view the [code](https://github.com/midwayjs/logger/blob/main/src/interface.ts).



## Basic log configuration

We can configure various behaviors of the log in the configuration file.

The log configuration in Midway includes **Global Configuration** and **Single Log Configuration**. The two configurations are merged and overwritten.

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

As mentioned above, each object in the `clients` configuration segment is an independent log configuration item, and its configuration will be merged with the `default` segment to create a logger instance.



## Configure log level


The winston log levels are divided into the following categories, and the log levels decrease in turn (the larger the number, the lower the level):
```typescript
const levels = {
  none: 0
  error: 1
  trace: 2
  warn: 3
  info: 4
  verbose: 5
  debug: 6
  silly: 7
  all: 8
}
```
In order to simplify the Midway, we usually use only four levels: `error`, `war`, `info`, and `debug`.

The log level represents the lowest level that can currently output logs. For example, if your log level is set to `WARN`, only logs of the `WARN` and higher `error` level can be output.

In Midway, different log levels can be configured for different output behaviors.

- `Level` Log Level of Text Written
- `consoleLevel` the log level output from the console



### The default level of the frame


In Midway, it has its own default log level.


- In the development environment (local,test,unittest), the text and console log levels are unified to `info`.
- In the server environment (except for the development environment), to reduce the number of logs, the log level is `warn`.



### Adjust log level

In general, we do not recommend adjusting the global default log level, but adjust the log level of a specific logger, for example:

Adjust `coreLogger` or `appLogger`.

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
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
  },
} as MidwayConfig;
```

In special scenarios, you can also temporarily adjust the global log level.

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      level: 'info',
      consoleLevel: 'warn'
    },
    // ...
  },
} as MidwayConfig;
```



## Configure the log root directory

By default, Midway outputs logs to the **root directory** during local development and server deployment.


- The root directory of the local log is `${app.appDir}/logs/project name`.
- The log root directory of the server is under the user directory `${process.env.HOME}/logs/project_name` (Linux/Mac) and `${process.env.USERPROFILE}/logs/project_name` (Windows), for example `/home/admin/logs/example-app`.

We can configure the root directory where the log is located.

```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      dir: '/home/admin/logs',
    },
    // ...
  },
} as MidwayConfig;
```



## Configure log cutting (rotation)


By default, the same log object **generates two files**.

Take `midway-core.log` as an example. When the application is started, a `midway-core with the timestamp of the day is generated. YYYY-MM files in-DD` format and a soft chain file of `midway-core.log` without timestamp.

> Soft chain will not be generated under windows


To facilitate log collection and viewing, the soft chain file always points to the latest log file.


At `00:00` in the morning, a new file of the form `midway-core.log.YYYY-MM-DD` is generated at the end of the day's log.

At the same time, when a single log file exceeds 200M, it will be automatically cut to generate a new log file.

You can adjust the cutting behavior by configuration.

```typescript
export default {
  midwayLogger: {
    default: {
      maxSize: '100m',
    },
    // ...
  },
} as MidwayConfig;
```



## Configure log cleanup

By default, the log will exist for 31 days.

This behavior can be adjusted by configuration, such as saving for 3 days instead.

```typescript
} as MidwayConfig;export default {
  midwayLogger: {
    default: {
      maxFiles: '3d',
    },
    // ...
  },
} as MidwayConfig;
```






## Advanced configuration

If you are not satisfied with the default log object, you can create and modify it yourself.



### Add custom log

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

You can call `@Logger('abcLogger')` to obtain custom logs.

For more log options, please refer to the [LoggerOptions description](https://github.com/midwayjs/logger/blob/main/src/interface.ts) in the interface.



### Configure log output format


The display format refers to the string structure of a single line of text when the log is output. Midway has customized Winston logs and provided some default objects.

For each logger object, you can configure an output format. The display format is a method that returns a string structure with the [info object](https://github.com/winstonjs/logform#info-objects) parameter of the Winston.

```typescript
export default {
  midwayLogger: {
    clients: {
      appLogger: {
        format: info => {
          return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}${info.message}`;
        }
        // ...
      },
      customOtherLogger: {
        format: info => {
          return 'xxxx';
        }
      }
    }
    // ...
  },
} as MidwayConfig;
```

The default properties of the info object are as follows:

| **Attribute Name** | **Description** | **Example** |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------ |
| timestamp | The timestamp. Default value: `'YYYY-MM-DD HH:mm:ss,SSS`.  | 2020-12-30 07:50:10,453 |
| level | Lowercase log level | info |
| LEVEL | Uppercase log level | INFO |
| pid | current process pid | 3847 |
| labelText | Aggregate text for labels | [abcde] |
| message | Combination of normal messages + error messages + error stacks | 1. plain text, such as `123456`, `hello world` <br />2, error text (error name + stack) error: another test error at object. anonymous (/home/runner/work/midway/packages/logger/test/index.test.ts:224:18) <br />3, plain text + error text hello world error: another test error at object. anonymous (/home/runner/work/midway/midway/packages/logger/test/index.test.ts:224:18) |
| stack | Error stack |                                                              |
| originError | Original error object | The error instance itself |
| originArgs | Original user input parameters | ['a', 'B', 'c'] |



### Get a custom context log

Context logs are typed based on **raw log objects**. All formats of the original logs are reused. The relationship between them is as follows.

```typescript
// Pseudocode
const contextLogger = customLogger.createContextLogger(ctx);
```

`@Inject` can only inject the default context logs. You can use the `ctx.getLogger` method to obtain the **context logs** corresponding to other **custom logs**. the context log is associated with ctx, and the same key in the same context will obtain the same log object. when ctx is destroyed, the log object will also be recycled.

```typescript
import { Provide } from '@midwayjs/decorator';
import { IMidwayLogger } from '@midwayjs/logger';
import { Context } from '@midwayjs/koa';

@Provide()
export class UserService {

  @Inject()
  ctx: Context;

  async getUser() {
    // The context log object corresponding to the customLogger is obtained here.
    const customLogger = this.ctx.getLogger('customLogger');
  	customLogger.info('hello world');
  }

}
```




### Configure the context log output format

Context logs are typed based on the **original log object**. All formats of the original log are reused. However, you can configure the corresponding context log format of the log object separately.

There are more ctx objects in the info object of the context log. Let's take the context log of the `customLogger` as an example.

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

Then when you use the context log output, it will default to your format.

```typescript
ctx.getLogger('customLogger').info('hello world');
// 2021-01-28 11:10:19,334 INFO 9223 [2ms POST] hello world
```

Note that because `App Logger` is the default log object for all frameworks, it is relatively special. Some existing frameworks have their context formats configured by default, resulting in invalid configuration in `midwayLogger` fields.

For this, you need to modify the context log format configuration of a framework separately, please jump to a different framework to view.

- [Modify the koa context log format](./extensions/koa# Modify Context Log)
- [Modify the context log format of the egg](./extensions/egg# Modify Context Log)
- [Modify express context log format](./extensions/express# Modify Context Log)



### Log default Transport

Each log contains several default Transport.

| Name | Default behavior | Description |
| ----------------- | -------- | ------------------------------ |
| Console Transport | Open | For output to console |
| File Transport | Open | For output to a text file |
| Error Transport | Open | Used to output errors to specific error logs |
| JSON Transport | Close | Text used to output JSON format |

It can be modified through configuration.

**Example: Only enable console output**

```typescript
export default {
  midwayLogger: {
    clients: {
      abcLogger: {
        enableFile: false
        enableError: false
        // ...
      }
    }
    // ...
  },
} as MidwayConfig;
```

**Example: Disable Console Output**

```typescript
export default {
  midwayLogger: {
    clients: {
      abcLogger: {
        enableConsole: false
        // ...
      }
    }
    // ...
  },
} as MidwayConfig;
```

**Example: Enable text and JSON synchronization and disable error output**

```typescript
export default {
  midwayLogger: {
    clients: {
      abcLogger: {
        enableConsole: false
        enableFile: true
        enableError: false
        enableJSON: true
        // ...
      }
    }
    // ...
  },
} as MidwayConfig;
```



### Custom Transport

The framework provides extended Transport functions, for example, you can write a Transport to transfer logs and upload them to other log libraries.

For example, in the following example, we will transfer the log to another local file.

```typescript
import { EmptyTransport } from '@midwayjs/logger';

class CustomTransport extends EmptyTransport {
  log(info, callback) {
    const levelLowerCase = info.level;
    if (levelLowerCase === 'error' || levelLowerCase === 'warn') {
      writeFileSync(join(logsDir, 'test.log'), info.message);
    }
    callback();
  }
}
```

We can initialize, add it to logger, or set level for Transport separately.

```typescript
const customTransport = new CustomTransport({
  level: 'warn',
});

logger.add(customTransport);
```

In this way, the original logger will automatically execute the Transport when printing logs.

All Transport are attached to the original logger instance (not context logger). If ctx data is required, it can be obtained from info. Note that it is empty.


```typescript
class CustomTransport extends EmptyTransport {
  log(info, callback) {
    if (info.ctx) {
      // ...
    } else {
      // ...
    }
    callback();
  }
}
```


We can also use dependency injection to define Transport.

```typescript
import { EmptyTransport, IMidwayLogger } from '@midwayjs/logger';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { MidwayLoggerService } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum)
export class CustomTransport extends EmptyTransport {
  log(info, callback) {
    // ...
    callback();
  }
}

// src/configuration.ts
@Configuration(/*...*/)
export class AutoConfiguration {

  @Inject()
  loggerService: MidwayLoggerService;

  @Inject()
  customTransport: CustomTransport;

  async onReady() {
    const appLogger = this.loggerService.getLogger('customLogger') as IMidwayLogger;
    appLogger.add(this.customTransport);
  }
}
```



## Frequently Asked Questions



### 1. The server environment log is not output

For the server environment, the default log level is warn, that is, logger.warn will print out. please check the "log level" section.

We do not recommend printing too many logs in the server environment, only printing the necessary content, too much log output affects performance, but also affects the rapid positioning problem.



### 2. The server does not have a console log

Generally speaking, the server console log (console) is closed and will only be output to the file. If there are special requirements, it can be adjusted separately.

