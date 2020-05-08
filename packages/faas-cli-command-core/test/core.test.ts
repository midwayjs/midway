import { CommandHookCore } from '../src';
import TestPlugin from './plugins/test.invoke';
import * as assert from 'assert';

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
    await core.ready();
    await core.invoke(['invoke']);
    assert(result && result.length === 3);
  });
});
