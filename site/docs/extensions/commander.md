# Commander（命令行）

`@midwayjs/commander` 是一个基于 Midway IoC 容器的命令行组件，底层使用 [commander.js](https://github.com/tj/commander.js#readme) 做参数解析与 help 输出。你可以用 Midway 熟悉的依赖注入方式组织命令、选项解析与业务逻辑，并将命令拆分为多个 Class。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ❌    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ❌   |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ✅    |

## 安装依赖

在现有项目中安装 commander 组件依赖。

```bash
$ npm i @midwayjs/commander@4  --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/commander": "^4.0.0"
  }
}
```

## 开启组件

在入口配置中引入组件。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as commander from '@midwayjs/commander';

@Configuration({
  imports: [commander],
})
export class MainConfiguration {}
```


## 编写命令

一个命令对应一个 Class，使用 `@Command()` 修饰，并实现 `CommandRunner` 接口的 `run()` 方法。

```typescript
// src/commands/hello.command.ts
import { Inject } from '@midwayjs/core';
import { Command, CommandRunner, Option } from '@midwayjs/commander';

@Command({
  name: 'hello',
  description: 'hello command',
  arguments: '<name>',
  aliases: ['hi'],
})
export class HelloCommand implements CommandRunner {
  @Inject()
  logger;

  @Option({
    flags: '-f, --foo [foo]',
    description: 'foo option',
    defaultValue: 'bar',
  })
  parseFoo(val: string) {
    return `${val}_parsed`;
  }

  async run(passedParams: string[], options?: Record<string, any>) {
    const [name] = passedParams;
    this.logger?.info?.(`hello ${name}`, options);
  }
}
```

### `@Command()` 参数

 - `name`：命令名称（命令行调用与 `--help` 展示时使用）
- `arguments`：命令位置参数声明（例如 `<name>`、`<a> [b]`）
- `description`：命令描述，会展示在 `--help` 中
- `argsDescription`：位置参数描述对象，会展示在 `--help` 中
- `aliases`：命令别名数组

### `@Option()` 参数

- `flags`：选项声明（例如 `-f, --foo [foo]`、`-n, --num <num>`）
- `description`：选项描述，会展示在 `--help` 中
- `defaultValue`：默认值（不传该选项时生效）
- `required`：是否必填（等价于 commander 的 `requiredOption`）

`@Option()` 修饰的方法会作为 commander 的自定义 parser，用于把字符串参数转换为业务需要的类型（例如 number/boolean/自定义格式）。

## 运行命令

该组件作为 Midway Framework 运行，在应用启动时会解析 `process.argv` 并执行匹配的命令。

如果你使用 `bootstrap.js` 作为入口，可以这样启动：

```javascript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```

然后运行：

```bash
$ node bootstrap.js hello world --foo baz
$ node bootstrap.js hi world
```

## 上下文

每次命令执行都会创建请求上下文（request context），可以在命令类中注入 `Context` 获取运行时信息：

```typescript
import { Command, CommandRunner, Context } from '@midwayjs/commander';
import { Inject } from '@midwayjs/core';

@Command({ name: 'info', arguments: '<name>' })
export class InfoCommand implements CommandRunner {
  @Inject()
  ctx: Context;

  async run() {
    this.ctx.commandName; // 命令名
    this.ctx.args; // 位置参数数组
    this.ctx.options; // commander 解析后的选项
    this.ctx.command; // commander 的 Command 实例
  }
}
```

## 交互式提问（Enquirer）

组件内置了基于 [enquirer](https://github.com/enquirer/enquirer) 的交互式提问能力，适用于运行过程中补齐参数。你可以用 `@QuestionSet()` 组织问题集合，并在命令里通过 `EnquirerService` 触发。

如果希望既支持命令行传参又支持交互补齐，请把对应选项设为可选（否则 commander 会在缺参时直接报错）。

```typescript
import {
  Command,
  CommandRunner,
  QuestionSet,
  Question,
  ValidateFor,
  DefaultFor,
  WhenFor,
  EnquirerService,
} from '@midwayjs/commander';
import { Inject } from '@midwayjs/core';

@QuestionSet()
class ProfileQuestionSet {
  @Question({ type: 'input', name: 'age', message: 'Your age?' })
  parseAge(value: string) {
    return Number.parseInt(value, 10);
  }

  @Question({ type: 'input', name: 'nickname', message: 'Nickname?' })
  parseNickname(value: string) {
    return value;
  }

  @ValidateFor({ name: 'age' })
  validateAge(value: string) {
    return value ? true : 'age required';
  }

  @DefaultFor({ name: 'nickname' })
  defaultNickname() {
    return 'neo';
  }

  @WhenFor({ name: 'nickname' })
  whenNickname(answers: Record<string, unknown>) {
    return Boolean(answers.useNickname);
  }
}

@Command({ name: 'ask' })
export class AskCommand implements CommandRunner {
  @Inject()
  enquirerService: EnquirerService;

  async run(_passedParams: string[], options?: Record<string, any>) {
    const answers = await this.enquirerService.prompt(ProfileQuestionSet, {
      useNickname: options?.useNickname,
    });
    // use answers.age / answers.nickname
  }
}
```

说明：
- `@Question()` 修饰的方法会作为 enquirer 的 `result`（用于转换用户输入）。
- `@DefaultFor()` 会映射到 enquirer 的 `initial`。
- `@WhenFor()` 支持根据已收集的答案决定是否提问。
- 可用的 `@*For()` 装饰器：`ValidateFor`、`ChoicesFor`、`MessageFor`、`DefaultFor`、`WhenFor`。
- `prompt()` 同时支持 `QuestionSet` 名称字符串或类引用，推荐使用类引用。

## 错误处理

默认情况下，CLI 入口会捕获异常并输出日志后退出进程。你可以在配置里提供 `errorHandler` 来接管错误处理：

```typescript
// src/config/config.default.ts
export default {
  commander: {
    errorHandler: (err: Error) => {
      console.error(err);
      process.exit(1);
    },
  },
};
```

如果你在命令里使用了 `@Catch()` 错误过滤器（Midway Filter），会先走过滤器逻辑，再进入这里的兜底处理。

## 返回值与输出

默认情况下，命令执行完毕后，如果 `run()` 有返回值，框架会将返回值输出到标准输出（stdout），方便用作脚本管道或在测试中断言输出内容。

支持的返回值类型：

- `string` / `Buffer`：直接写入 stdout
- 普通对象：使用 `JSON.stringify` 后写入 stdout
- `Readable`：会 pipe 到 stdout
- `AsyncIterable`：会按迭代顺序逐段写入 stdout

下面是一个返回文本/JSON 的例子（使用 core 的 `ServerResponse` 语义来组织输出格式）：

```typescript
import { Command, CommandRunner, CliServerResponse } from '@midwayjs/commander';

@Command({ name: 'status' })
export class StatusCommand implements CommandRunner {
  async run() {
    return new CliServerResponse({} as any).success().json({ ok: true });
  }
}
```

如果希望按 chunk 逐步输出，可以返回 `CliServerResponse().stream()`：

```typescript
import { Command, CommandRunner, CliServerResponse } from '@midwayjs/commander';

@Command({ name: 'stream' })
export class StreamCommand implements CommandRunner {
  async run() {
    const response = new CliServerResponse({} as any);
    const stream = response.stream();

    setImmediate(() => {
      stream.send('a');
      stream.send({ b: 2 });
      stream.end();
    });

    return stream;
  }
}
```

## 日志

组件默认会注册一个名为 `commanderLogger` 的 logger，默认写入 `midway-commander.log`。

你可以在命令类里通过 `@Logger('commanderLogger')` 注入使用，例如：

```typescript
import { Logger, ILogger } from '@midwayjs/core';
import { Command, CommandRunner } from '@midwayjs/commander';

@Command({ name: 'hello', arguments: '<name>' })
export class HelloCommand implements CommandRunner {
  @Logger('commanderLogger')
  logger: ILogger;

  async run(passedParams: string[]) {
    this.logger.info('hello %s', passedParams[0]);
  }
}
```

如果希望自定义日志文件名或级别，可以在应用配置中覆盖 `midwayLogger.clients.commanderLogger`：

```typescript
// src/config/config.default.ts
export default {
  midwayLogger: {
    clients: {
      commanderLogger: {
        fileLogName: 'my-commander.log',
        level: 'info',
      },
    },
  },
};
```

## 单元测试

命令行参数在测试环境中很容易被 Jest/Node 参数污染，推荐通过 framework 的 `runCommand()` 来执行命令，而不是直接 mock `process.argv`。

```typescript
import { createLightApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/commander';
import * as commander from '@midwayjs/commander';

describe('commander', () => {
  it('should run command', async () => {
    const app = await createLightApp({
      imports: [commander],
      preloadModules: [HelloCommand],
    });

    const framework = app.getFramework() as Framework;
    await framework.runCommand('hello', 'world', '--foo', 'bar');

    await close(app);
  });
});
```
