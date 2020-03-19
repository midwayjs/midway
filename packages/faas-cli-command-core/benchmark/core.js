const { Suite } = require('benchmark');
const { BasePlugin, CommandHookCore } = require('../dist/');

class Plugin extends BasePlugin {
  provider = 'test';
  commands = {
    invoke: {
      usage: 'test provider invoke',
      lifecycleEvents: ['one', 'two'],
      options: {
        function: {
          usage: 'function name',
          shortcut: 'f',
        },
      },
    },
  };
  hooks = {
    'before:invoke:one': () => {
      this.core.cli.log('before:invoke:one');
    },
    'invoke:one': async () => {
      this.core.cli.log('invoke:one');
    },
    'after:invoke:one': () => {
      this.core.cli.log('after:invoke:one');
    },
    'before:invoke:two': async () => {
      this.core.cli.log('before:invoke:two');
    },
    'invoke:two': () => {
      this.core.cli.log('invoke:two');
    },
    'after:invoke:two': async () => {
      this.core.cli.log('after:invoke:two');
    },
  };
}

const Corefunc = async () => {
  const core = new CommandHookCore({
    provider: 'test',
    options: {
      h: true,
    },
  });
  await core.ready();
  await core.invoke();
};

const CorefuncTest = async () => {
  const core = new CommandHookCore({
    provider: 'test',
    options: {
      h: true,
    },
  });
  core.addPlugin(Plugin);
  await core.ready();
  await core.invoke();
};

const CorefuncTestInvoke = async () => {
  const core = new CommandHookCore({
    provider: 'test',
    options: {
      h: true,
    },
  });
  core.addPlugin(Plugin);
  await core.ready();
  await core.invoke('invoke');
};
const contenders = {
  'pure core': Corefunc,
  'core help': CorefuncTest,
};

console.log('\nBenchmark:');
const bench = new Suite().on('cycle', e => {
  console.log('  ' + e.target);
});

Object.keys(contenders).forEach(name => {
  bench.add(name.padEnd(20, ' '), async () => {
    await contenders[name]();
  });
});

bench.run({ async: true });
