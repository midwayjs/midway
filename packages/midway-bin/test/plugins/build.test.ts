import { BuildPlugin } from '../../src/plugins/build';
import { resolve, join } from 'path';
import { CommandHookCore } from '@midwayjs/fcli-command-core';
import { existsSync } from 'fs-extra';
import * as assert from 'assert';

describe('/test/plugins/build.test.ts', () => {

  it('should test run build', async () => {
    const baseDir = resolve(__dirname, '../fixtures/ts-dir-without-config');
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['build'],
      service: {},
      options: {},
      log: console,
      provider: ''
    });
    core.addPlugin(BuildPlugin);
    await core.ready();
    await core.invoke(['build']);
    assert(existsSync(join(baseDir, 'node_modules')));
    assert(existsSync(join(baseDir, 'src')));
    assert(existsSync(join(baseDir, 'package.json')));
    assert(existsSync(join(baseDir, 'copy.js')));
    assert(existsSync(join(baseDir, 'tsconfig.json')));
  });
});
