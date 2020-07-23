import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { resolve, join } from 'path';
import { existsSync, remove, readFileSync } from 'fs-extra';
import * as assert from 'assert';

describe('/test/package-a[[.test.ts', () => {
  describe('package application layer project', () => {
    const baseDir = resolve(__dirname, './fixtures/app-layer');

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
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      const buildPath = join(baseDir, '.serverless');
      assert(existsSync(join(buildPath, 'f.yml')));
      assert(existsSync(join(buildPath, 'app')));
      assert(existsSync(join(buildPath, 'config')));
      assert(
        /npm:@midwayjs\/egg-layer/.test(
          readFileSync(join(buildPath, 'f.yml')).toString('utf8')
        )
      );
    });
  });
});
