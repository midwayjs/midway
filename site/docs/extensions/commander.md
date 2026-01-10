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

- `name`：命令名称
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
