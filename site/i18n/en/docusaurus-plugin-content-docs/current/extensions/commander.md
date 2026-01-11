# Command Line

`@midwayjs/commander` is a command-line component built on the Midway IoC container. It uses [commander.js](https://github.com/tj/commander.js#readme) under the hood for argument parsing and help output. You can organize commands, option parsing, and business logic with the familiar Midway dependency injection approach, and split commands into multiple classes.

Related information:

| Description                |      |
| -------------------------- | ---- |
| Available for standard app | ❌    |
| Available for Serverless   | ❌    |
| Available for integrated   | ❌    |
| Includes standalone core   | ✅    |
| Includes standalone logger | ✅    |

## Install

Install the commander component dependency in an existing project.

```bash
$ npm i @midwayjs/commander@4  --save
```

Or add the following dependency to `package.json`, then reinstall.

```json
{
  "dependencies": {
    "@midwayjs/commander": "^4.0.0"
  }
}
```

## Enable the component

Import the component in the entry configuration.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as commander from '@midwayjs/commander';

@Configuration({
  imports: [commander],
})
export class MainConfiguration {}
```

## Write a command

Example directory layout:

```bash
.
├── src
│   ├── commands
│   │   ├── hello.command.ts
│   │   └── status.command.ts
│   ├── configuration.ts
│   └── ...
├── bootstrap.js
└── package.json
```

Each command corresponds to a class, decorated with `@Command()`, and implements the `run()` method from the `CommandRunner` interface.


```typescript
// src/commands/hello.command.ts
import { Inject, ILogger } from '@midwayjs/core';
import { Command, CommandRunner, Option } from '@midwayjs/commander';

@Command({
  name: 'hello',
  description: 'hello command',
  arguments: '<name>',
  aliases: ['hi'],
})
export class HelloCommand implements CommandRunner {
  @Inject()
  logger: ILogger;

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

### `@Command()` parameters

- `name`: command name (used for CLI invocation and `--help` display)
- `arguments`: positional arguments declaration (for example, `<name>`, `<a> [b]`)
- `description`: command description, shown in `--help`
- `argsDescription`: object describing positional arguments, shown in `--help`
- `aliases`: array of command aliases

### `@Option()` parameters

- `flags`: option declaration (for example, `-f, --foo [foo]`, `-n, --num <num>`)
- `description`: option description, shown in `--help`
- `defaultValue`: default value (applies when the option is not provided)
- `required`: whether it is required (equivalent to commander's `requiredOption`)

Methods decorated with `@Option()` act as commander's custom parser to convert string inputs into the types required by your business logic (for example, number/boolean/custom formats).

## Run a command

This component runs as a Midway Framework. When the application starts, it parses `process.argv` and executes the matched command.

If you use `bootstrap.js` as the entry, start it like this:

```javascript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```

Then run:

```bash
$ node bootstrap.js hello world --foo baz
$ node bootstrap.js hi world
```

## Context

Each command execution creates a request context. You can inject `Context` in your command class to access runtime information:

```typescript
import { Command, CommandRunner, Context } from '@midwayjs/commander';
import { Inject } from '@midwayjs/core';

@Command({ name: 'info', arguments: '<name>' })
export class InfoCommand implements CommandRunner {
  @Inject()
  ctx: Context;

  async run() {
    this.ctx.commandName; // command name
    this.ctx.args; // positional arguments
    this.ctx.options; // parsed options
    this.ctx.command; // commander Command instance
  }
}
```

## Interactive prompts (Enquirer)

This component ships with [enquirer](https://github.com/enquirer/enquirer) integration for interactive CLI input. Define question sets with `@QuestionSet()` and trigger them from your command via `EnquirerService`.

If you want both CLI options and interactive input for the same field, make the option optional; required options will make commander fail before the prompt runs.

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

Notes:
- Methods decorated by `@Question()` become enquirer's `result` (for input transformation).
- `@DefaultFor()` maps to enquirer's `initial`.
- `@WhenFor()` decides whether to ask based on collected answers.
- Available `@*For()` decorators: `ValidateFor`, `ChoicesFor`, `MessageFor`, `DefaultFor`, `WhenFor`.
- `prompt()` accepts either a `QuestionSet` name string or a class reference, with class reference preferred.

## Error handling

By default, the CLI entry catches errors, logs them, and exits the process. You can override this behavior with `errorHandler` in your config:

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

If you use `@Catch()` filters (Midway Filter) inside commands, they run before the fallback handler is invoked.

## Return values and output

By default, after a command finishes, if `run()` returns a value, the framework writes it to standard output (stdout). This is useful for shell pipelines and for asserting output in tests.

Supported return types:

- `string` / `Buffer`: written to stdout directly
- Plain objects: written as `JSON.stringify(value)`
- `Readable`: piped to stdout
- `AsyncIterable`: iterated and written chunk by chunk

Example: return text/JSON using the same response semantics as core `ServerResponse`:

```typescript
import { Command, CommandRunner, CliServerResponse } from '@midwayjs/commander';

@Command({ name: 'status' })
export class StatusCommand implements CommandRunner {
  async run() {
    return new CliServerResponse({} as any).success().json({ ok: true });
  }
}
```

If you want streaming output, return `CliServerResponse().stream()`:

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

## Logger

By default, the component registers a logger named `commanderLogger`, which writes to `midway-commander.log`.

You can inject and use it in a command class via `@Logger('commanderLogger')`, for example:

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

If you want to customize the log file name or level, you can override `midwayLogger.clients.commanderLogger` in your application configuration:

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

## Unit testing

Command-line arguments can easily be polluted by Jest/Node arguments in tests. It's recommended to execute commands via the framework's `runCommand()` rather than mocking `process.argv` directly.

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
