import { Command, Option, CommandRunner, Framework } from '../src';
import { Inject, Singleton } from '@midwayjs/core';
import { createLightApp, close } from '@midwayjs/mock';

@Singleton()
class TestService {
  public executed = false;
  public lastCommand?: string;
  public options: any;
  public args: any[];

  reset() {
    this.executed = false;
    this.lastCommand = undefined;
    this.options = undefined;
    this.args = undefined;
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

describe('test/index.test.ts', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = [ 'node', 'cli' ];
  });

  afterEach(() => {
    process.argv = originalArgv;
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
});
