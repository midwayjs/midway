import * as CommandHookCore from '..';
import InvokePlugin from './plugins/test.invoke';
import LogPlugin from './plugins/test.log';
import OnePlugin from './plugins/one.common';
import * as assert from 'assert';
describe('load plugin', () => {
  it('sigle plugin and liftcycles', async () => {
    const core = new CommandHookCore({
      provider: 'test',
      options: {},
    });
    core.addPlugin(InvokePlugin);
    await core.ready();
    const allCommands = core.getCommands();
    assert(allCommands.invoke && allCommands.invoke.lifecycles.length === 6);
  });

  it('multi plugins', async () => {
    const core = new CommandHookCore({
      provider: 'test',
      options: {},
    });
    core.addPlugin(InvokePlugin);
    core.addPlugin(LogPlugin);
    await core.ready();
    const allCommands = core.getCommands();
    assert(allCommands.invoke && allCommands.log);
  });

  it('different provider plugins', async () => {
    const core = new CommandHookCore({
      provider: 'one',
      options: {},
    });
    core.addPlugin(InvokePlugin);
    core.addPlugin(LogPlugin);
    core.addPlugin(OnePlugin);
    await core.ready();
    const allCommands = core.getCommands();
    assert(!allCommands.invoke && !allCommands.log && allCommands.common);
  });
});

describe('invoke', () => {
  it('invoke plugin call and hack log', async () => {
    const result: string[] = [];
    const core = new CommandHookCore({
      provider: 'test',
      options: {
        f: 'index',
      },
      log: {
        log: (msg: string) => {
          result.push(msg);
        },
      },
    });
    core.addPlugin(InvokePlugin);
    await core.ready();
    await core.invoke(['invoke']);
    assert(
      result.length === 6 &&
        result[1] === 'invoke:one' &&
        result[3] === 'before:invoke:two'
    );
  });

  it('use log plugin call invoke plugin', async () => {
    const result: string[] = [];
    const core = new CommandHookCore({
      provider: 'test',
      options: {},
      log: {
        log: (msg: string) => {
          result.push(msg);
        },
      },
    });
    core.addPlugin(InvokePlugin);
    core.addPlugin(LogPlugin);
    await core.ready();
    await core.invoke(['log']);
    assert(
      result.length === 6 &&
        result[1] === 'invoke:one' &&
        result[3] === 'before:invoke:two'
    );
  });
});
