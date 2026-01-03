import { Command, Option, CommandRunner, Framework } from '../src';
import { Inject, Singleton } from '@midwayjs/core';
import { createLightApp, close } from '@midwayjs/mock';

@Singleton()
class TestService {
  public executed = false;
  public options: any;
  public args: any[];
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
    // console.log('Hello Command Executed', passedParams, options);
    this.testService.executed = true;
    this.testService.args = passedParams;
    this.testService.options = options;
  }
}

describe('test/index.test.ts', () => {
  it('should run cli command', async () => {
    const app = await createLightApp({
      imports: [
        require('../src')
      ],
      preloadModules: [
        HelloCommand,
        TestService
      ]
    });

    const framework = app.getFramework() as Framework;
    await framework.runCommand('hello', 'world', '--foo', 'bar');

    const testService = await app.getApplicationContext().getAsync(TestService);
    expect(testService.executed).toBeTruthy();
    expect(testService.args[0]).toEqual('world');
    expect(testService.options.foo).toEqual('bar_parsed');

    await close(app);
  });
});
