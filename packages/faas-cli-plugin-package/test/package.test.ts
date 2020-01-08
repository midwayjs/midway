import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { resolve } from 'path';
import { existsSync } from 'fs';
import * as assert from 'assert';

const baseDir = resolve(__dirname, './fixtures/base-app');

describe('package', () => {
  it('base package', async () => {
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['package'],
      service: loadSpec(baseDir),
      provider: 'aliyun',
      options: {},
      log: console
    });
    core.addPlugin(PackagePlugin);
    await core.ready();
    await core.invoke(['package']);
    assert(existsSync(resolve(baseDir, '.serverless/dist/index.js')) && existsSync(resolve(baseDir, 'serverless.zip')));
  });
  it('build target package', async () => {
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['package'],
      service: loadSpec(baseDir),
      provider: 'aliyun',
      options: {
        buildDir: '.serverless/userbuild'
      },
      log: console
    });
    core.addPlugin(PackagePlugin);
    await core.ready();
    await core.invoke(['package']);
    assert(existsSync(resolve(baseDir, '.serverless/userbuild/dist/index.js')) && existsSync(resolve(baseDir, 'serverless.zip')));
  });
});
