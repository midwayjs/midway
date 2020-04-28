import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { AliyunFCPlugin } from '../../faas-cli-plugin-fc/src/index';
import { resolve } from 'path';
import { existsSync, remove } from 'fs-extra';
import * as assert from 'assert';

describe('/test/package.test.ts', () => {
  describe('integration project build', () => {
    it('aggregation package', async () => {
      const baseDir = resolve(__dirname, './fixtures/aggregation');
      const buildDir = resolve(baseDir, './.serverless');
      await remove(buildDir);
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {},
        log: console,
      });
      core.addPlugin(PackagePlugin);
      core.addPlugin(AliyunFCPlugin);
      await core.ready();
      await core.invoke(['package']);
      assert(existsSync(resolve(buildDir, 'api.js')));
      assert(existsSync(resolve(buildDir, 'normal.js')));
      assert(existsSync(resolve(buildDir, 'renderNot2.js')));
    });
  });
});
