import { CommandHookCore } from '../src';
import TestPlugin from './plugins/test.invoke';
import { PluginTest2 } from './plugins/test-not-provider.invoke';
import * as assert from 'assert';
import { join } from 'path';
import { readFileSync } from 'fs';

describe('command-core', () => {
  it('stop lifecycle', async () => {
    const result: string[] = [];
    const core = new CommandHookCore({
      provider: 'test',
      log: {
        log: (msg: string) => {
          result.push(msg);
        },
      },
      stopLifecycle: 'invoke:one',
    });
    core.addPlugin(TestPlugin);
    core.addPlugin(PluginTest2);
    await core.ready();
    await core.invoke(['invoke']);
    assert(result && result.length === 3);
  });
  it('stop lifecycle and resume', async () => {
    const result: string[] = [];
    const core = new CommandHookCore({
      provider: 'test',
      log: {
        log: (msg: string) => {
          result.push(msg);
        },
      },
      stopLifecycle: 'invoke:one',
    });
    core.addPlugin(TestPlugin);
    await core.ready();
    await core.invoke(['invoke']);
    assert(result.length === 3);
    await core.resume();
    assert((result as any).length === 6);
  });
  it('user lifecycle', async () => {
    const cwd = join(__dirname, './fixtures/userLifecycle');
    const tmpData = Date.now() + '';
    process.env.TEST_MIDWAY_CLI_CORE_TMPDATA = tmpData;
    const core = new CommandHookCore({
      provider: 'test',
      cwd,
      options: {
        verbose: true,
      },
    });
    core.addPlugin(TestPlugin);
    await core.ready();
    await core.invoke(['invoke']);
    const testData = readFileSync(join(cwd, 'test.txt')).toString();
    assert(testData === tmpData);
  });
});
