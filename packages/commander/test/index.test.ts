import {
  CliServerResponse,
  Command,
  Option,
  CommandRunner,
  Context,
  Framework,
  QuestionSet,
  Question,
  ValidateFor,
  DefaultFor,
  WhenFor,
  EnquirerService,
} from '../src';
import { Inject, Singleton } from '@midwayjs/core';
import { createLightApp, close } from '@midwayjs/mock';
jest.mock('enquirer', () => ({
  prompt: jest.fn(async questionInput => {
    const question = Array.isArray(questionInput)
      ? questionInput[0]
      : questionInput;
    let value: unknown;
    if (question.name === 'age') {
      value = '18';
    } else if (question.name === 'nickname') {
      value = undefined;
    } else {
      value = 'default';
    }

    if (question.validate) {
      await question.validate(value);
    }
    if (question.result) {
      value = await question.result(value);
    }
    if (value === undefined && question.initial !== undefined) {
      value =
        typeof question.initial === 'function'
          ? await question.initial()
          : question.initial;
    }
    return { [question.name]: value };
  }),
}));

const enquirer = require('enquirer');

@Singleton()
class TestService {
  public executed = false;
  public lastCommand?: string;
  public options: any;
  public args: any[];
  public ctxCommandName?: string;
  public ctxOptions?: any;
  public ctxArgs?: string[];
  public ctxCommand?: any;
  public promptAnswers?: Record<string, any>;

  reset() {
    this.executed = false;
    this.lastCommand = undefined;
    this.options = undefined;
    this.args = undefined;
    this.ctxCommandName = undefined;
    this.ctxOptions = undefined;
    this.ctxArgs = undefined;
    this.ctxCommand = undefined;
    this.promptAnswers = undefined;
  }
}

@Command({
  name: 'hello',
  description: 'hello command',
  arguments: '<name>'
})
class HelloCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  @Option({
    flags: '-f, --foo [foo]',
    description: 'foo option'
  })
  parseFoo(val: string) {
    return val + '_parsed';
  }

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'hello';
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

@Command({
  name: 'aliased',
  aliases: [ 'a' ],
  arguments: '<name>'
})
class AliasedCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'aliased';
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

@Command({
  name: 'defaultOpt',
  arguments: '<name>'
})
class DefaultOptionCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  @Option({
    flags: '-f, --foo [foo]',
    defaultValue: 'default_foo'
  })
  parseFoo(val: string) {
    return val + '_parsed';
  }

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'defaultOpt';
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

@Command({
  name: 'requiredOpt',
  arguments: '<name>'
})
class RequiredOptionCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  @Option({
    flags: '-r, --req <req>',
    required: true
  })
  parseReq(val: string) {
    return val.toUpperCase();
  }

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'requiredOpt';
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

@Command({
  name: 'multiArgs',
  arguments: '<a> [b]'
})
class MultiArgsCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'multiArgs';
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

@Command({
  name: 'numOpt',
  arguments: '<name>'
})
class NumberOptionCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  @Option({
    flags: '-n, --num <num>'
  })
  parseNum(val: string) {
    return Number.parseInt(val, 10);
  }

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'numOpt';
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

@Command({
  name: 'withContext',
  arguments: '<name>'
})
class WithContextCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  @Inject()
  ctx: Context;

  @Option({
    flags: '-f, --foo [foo]'
  })
  parseFoo(val: string) {
    return val;
  }

  async run(passedParams: string[], options?: Record<string, any>) {
    this.testService.executed = true;
    this.testService.lastCommand = 'withContext';
    this.testService.args = passedParams;
    this.testService.options = options;
    this.testService.ctxCommandName = this.ctx.commandName;
    this.testService.ctxOptions = this.ctx.options;
    this.testService.ctxArgs = this.ctx.args;
    this.testService.ctxCommand = this.ctx.command;
  }
}

@QuestionSet({ name: 'profile' })
class ProfileQuestionSet {
  @Question({
    type: 'input',
    name: 'age',
    message: 'age',
  })
  parseAge(value: string) {
    return Number.parseInt(value, 10);
  }

  @Question({
    type: 'input',
    name: 'nickname',
    message: 'nickname',
  })
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

@Command({
  name: 'ask',
})
class AskCommand implements CommandRunner {
  @Inject()
  testService: TestService;

  @Inject()
  enquirerService: EnquirerService;

  @Option({
    flags: '--useNickname [useNickname]',
  })
  parseUseNickname(value: string) {
    return value !== 'false';
  }

  async run(_passedParams: string[], options?: Record<string, any>) {
    const answers = await this.enquirerService.prompt('profile', {
      useNickname: options?.useNickname,
    });
    this.testService.promptAnswers = answers;
  }
}

@Command({
  name: 'returnText',
})
class ReturnTextCommand implements CommandRunner {
  async run() {
    return new CliServerResponse({} as any).success().text('hello');
  }
}

@Command({
  name: 'returnJson',
})
class ReturnJsonCommand implements CommandRunner {
  async run() {
    return new CliServerResponse({} as any).success().json({ a: 1 });
  }
}

@Command({
  name: 'returnStream',
})
class ReturnStreamCommand implements CommandRunner {
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

@Command({
  name: 'returnAsyncIterable',
})
class ReturnAsyncIterableCommand implements CommandRunner {
  async run() {
    async function* remoteStream() {
      yield 'a';
      await new Promise(resolve => setTimeout(resolve, 10));
      yield { b: 2 };
      await new Promise(resolve => setTimeout(resolve, 10));
      yield 'c';
    }

    return remoteStream();
  }
}

describe('test/index.test.ts', () => {
  const originalArgv = process.argv;
  const originalWrite = process.stdout.write;
  let stdout = '';

  beforeEach(() => {
    process.argv = [ 'node', 'cli' ];
    stdout = '';
    process.stdout.write = ((chunk: any) => {
      stdout += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      return true;
    }) as any;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.stdout.write = originalWrite;
  });

  async function createApp() {
    const app = await createLightApp({
      imports: [
        require('../src')
      ],
      preloadModules: [
        HelloCommand,
        AliasedCommand,
        DefaultOptionCommand,
        RequiredOptionCommand,
        MultiArgsCommand,
        NumberOptionCommand,
        WithContextCommand,
        ProfileQuestionSet,
        AskCommand,
        ReturnTextCommand,
        ReturnJsonCommand,
        ReturnStreamCommand,
        ReturnAsyncIterableCommand,
        TestService,
      ]
    });

    const framework = app.getFramework() as Framework;
    const testService = await app.getApplicationContext().getAsync(TestService);
    testService.reset();
    return { app, framework, testService };
  }

  it('should run cli command', async () => {
    const { app, framework, testService } = await createApp();
    expect(framework.getLogger('commanderLogger')).toBeDefined();
    await framework.runCommand('hello', 'world', '--foo', 'bar');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('hello');
    expect(testService.args[0]).toEqual('world');
    expect(testService.options.foo).toEqual('bar_parsed');

    await close(app);
  });

  it('should run command by alias', async () => {
    const { app, framework, testService } = await createApp();
    await framework.runCommand('a', 'world');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('aliased');
    expect(testService.args).toEqual([ 'world' ]);

    await close(app);
  });

  it('should apply defaultValue when option missing', async () => {
    const { app, framework, testService } = await createApp();
    await framework.runCommand('defaultOpt', 'world');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('defaultOpt');
    expect(testService.args).toEqual([ 'world' ]);
    expect(testService.options.foo).toEqual('default_foo');

    await close(app);
  });

  it('should enforce required option', async () => {
    const { app, framework, testService } = await createApp();
    await expect(framework.runCommand('requiredOpt', 'world')).rejects.toBeDefined();

    expect(testService.executed).toBeFalsy();
    expect(testService.lastCommand).toBeUndefined();

    await close(app);
  });

  it('should parse required option with custom parser', async () => {
    const { app, framework, testService } = await createApp();
    await framework.runCommand('requiredOpt', 'world', '--req', 'abc');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('requiredOpt');
    expect(testService.args).toEqual([ 'world' ]);
    expect(testService.options.req).toEqual('ABC');

    await close(app);
  });

  it('should pass multiple command arguments', async () => {
    const { app, framework, testService } = await createApp();
    await framework.runCommand('multiArgs', 'a', 'b');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('multiArgs');
    expect(testService.args).toEqual([ 'a', 'b' ]);

    await close(app);
  });

  it('should parse number option', async () => {
    const { app, framework, testService } = await createApp();
    await framework.runCommand('numOpt', 'world', '--num', '42');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('numOpt');
    expect(testService.args).toEqual([ 'world' ]);
    expect(testService.options.num).toEqual(42);

    await close(app);
  });

  it('should expose context for command execution', async () => {
    const { app, framework, testService } = await createApp();
    await framework.runCommand('withContext', 'world', '--foo', 'bar');

    expect(testService.executed).toBeTruthy();
    expect(testService.lastCommand).toEqual('withContext');
    expect(testService.ctxCommandName).toEqual('withContext');
    expect(testService.ctxArgs).toEqual([ 'world' ]);
    expect(testService.ctxOptions.foo).toEqual('bar');
    expect(testService.ctxCommand).toBeDefined();

    await close(app);
  });

  it('should run prompt with enquirer service', async () => {
    const { app, framework, testService } = await createApp();
    const promptMock = enquirer.prompt as jest.Mock;
    promptMock.mockClear();

    await framework.runCommand('ask', '--useNickname');

    expect(testService.promptAnswers.age).toEqual(18);
    expect(testService.promptAnswers.nickname).toEqual('neo');
    const askedNames = promptMock.mock.calls.map(call => {
      const question = call[0];
      return Array.isArray(question) ? question[0].name : question.name;
    });
    expect(askedNames).toEqual([ 'age', 'nickname' ]);

    await close(app);
  });

  it('should run prompt with question set class', async () => {
    const { app, testService } = await createApp();
    const promptMock = enquirer.prompt as jest.Mock;
    promptMock.mockClear();

    const enquirerService = await app.getApplicationContext().getAsync(EnquirerService);
    const answers = await enquirerService.prompt(ProfileQuestionSet, {
      useNickname: true,
    });
    testService.promptAnswers = answers;

    expect(testService.promptAnswers.age).toEqual(18);
    expect(testService.promptAnswers.nickname).toEqual('neo');
    const askedNames = promptMock.mock.calls.map(call => {
      const question = call[0];
      return Array.isArray(question) ? question[0].name : question.name;
    });
    expect(askedNames).toEqual([ 'age', 'nickname' ]);

    await close(app);
  });

  it('should output text when command returns string', async () => {
    const { app, framework } = await createApp();
    await framework.runCommand('returnText');
    expect(stdout).toEqual('hello');
    await close(app);
  });

  it('should output json when command returns object', async () => {
    const { app, framework } = await createApp();
    await framework.runCommand('returnJson');
    expect(stdout).toEqual(JSON.stringify({ success: 'true', data: { a: 1 } }));
    await close(app);
  });

  it('should output stream chunks when command returns stream', async () => {
    const { app, framework } = await createApp();
    await framework.runCommand('returnStream');
    expect(stdout).toEqual('a' + JSON.stringify({ b: 2 }));
    await close(app);
  });

  it('should output async iterable chunks when command returns AsyncIterable', async () => {
    const { app, framework } = await createApp();
    await framework.runCommand('returnAsyncIterable');
    expect(stdout).toEqual('a' + JSON.stringify({ b: 2 }) + 'c');
    await close(app);
  });
});
