# Commander (Command Line)

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

Each command corresponds to a class, decorated with `@Command()`, and implements the `run()` method from the `CommandRunner` interface.

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

### `@Command()` parameters

- `name`: command name
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
