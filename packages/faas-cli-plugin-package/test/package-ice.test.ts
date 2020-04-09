import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { resolve, join } from 'path';
import { existsSync, remove } from 'fs-extra';
import * as assert from 'assert';

describe('/test/package-ice.test.ts', () => {
  describe('package base midway faas project', () => {
    const baseDir = resolve(__dirname, './fixtures/ts-dir');

    afterEach(async () => {
      await remove(join(baseDir, 'serverless.zip'));
      await remove(join(baseDir, 'package-lock.json'));
      // await remove(join(baseDir, '.serverless'));
      await remove(join(baseDir, 'node_modules'));
    });
    it('base package', async () => {
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {
          sourceDir: 'src/apis'
        },
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      const buildPath = join(baseDir, '.serverless');
      assert(existsSync(join(buildPath, 'dist/index.js')));
      assert(!existsSync(join(buildPath, 'dist/apis')));
    });
  });
});
