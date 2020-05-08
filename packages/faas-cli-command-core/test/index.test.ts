import { CommandHookCore, PluginManager } from '../src';
import ErrorMap from '../src/errorMap';
import InvokePlugin from './plugins/test.invoke';
import LogPlugin from './plugins/test.lg';
import OnePlugin from './plugins/one.common';
import StoreSet from './plugins/store.set';
import StoreGet from './plugins/store.get';
import { resolve } from 'path';

import * as assert from 'assert';

describe('load plugin', () => {
  it('sigle plugin and lifecycleEvents', async () => {
    const core = new CommandHookCore({
      provider: 'test',
      options: {},
    });
    core.addPlugin(InvokePlugin);
    await core.ready();
    const allCommands = core.getCommands();
    assert(
      allCommands.invoke && allCommands.invoke.lifecycleEvents.length === 2
    );
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
      options: {
        point: () => {},
      },
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

  it('store set', async () => {
    const core = new CommandHookCore({
      provider: '',
      options: null,
    });
    core.addPlugin(StoreGet);
    core.addPlugin(StoreSet);
    core.addPlugin(StoreSet);
    await core.ready();
    await core.invoke(['store'], false, {});
    assert((core as any).coreInstance.store.get('StoreGet:get') === 123456);
  });

  it('spawn', async () => {
    const core = new CommandHookCore({
      provider: 'test',
      options: null,
    });
    core.addPlugin(StoreGet);
    core.addPlugin(StoreSet);
    core.addPlugin(StoreSet);
    core.addPlugin(class Test {});
    core.addPlugin('npm:test2:debug');
    core.addPlugin(`local:test:${resolve(__dirname, './plugins/store.set')}`);
    core.addPlugin('local:test2:./plugins/store.set');
    core.addPlugin('xxx');
    await core.ready();
    await core.spawn('store', {});
    assert((core as any).coreInstance.store.get('StoreGet:get') === 123456);
  });

  it('pluginManager', async () => {
    const core = new CommandHookCore({
      provider: '',
      options: {
        l: true,
      },
    });
    core.addPlugin(PluginManager);
    await core.ready();
    await core.spawn('plugin', {});
  });
});

describe('errorMap', () => {
  it('error', () => {
    assert(ErrorMap('notMatch', 'notMatch').message === 'error');
    assert(
      ErrorMap('commandIsEntrypoint', { command: '1' }).message ===
        'command 1 is entrypoint, cannot invoke'
    );
    assert(
      ErrorMap('commandNotFound', { command: '2' }).message ===
        'command 2 not found'
    );
    assert(
      ErrorMap('localPlugin', { path: 'test', err: { message: '4' } })
        .message === "load local plugin 'test' error '4'"
    );
    assert(
      ErrorMap('npmPlugin', { path: 'test', err: { message: '5' } }).message ===
        "load npm plugin 'test' error '5'"
    );
    assert(
      ErrorMap('pluginType', {}).message ===
        'only support npm / local / class plugin'
    );
  });
});
