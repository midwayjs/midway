import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { AliyunFCPlugin } from '../../faas-cli-plugin-fc/src/index';
import { FaaSTmpOutPlugin } from './fixtures/plugins/faas_tmp_out';
import { resolve } from 'path';
import { remove, existsSync, readFileSync } from 'fs-extra';
import * as assert from 'assert';

describe('/test/noyaml.test.ts', () => {
  describe('integration project build', () => {
    it('aggregation package', async () => {
      const baseDir = resolve(__dirname, 'fixtures/noYaml');
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
      core.addPlugin(FaaSTmpOutPlugin);
      await core.ready();
      await core.invoke(['package']);
      assert(!existsSync(resolve(buildDir, 'faas_tmp_out')));
      assert(
        /console.log\('test\.js'\)/.test(
          readFileSync(resolve(buildDir, 'test.js')).toString()
        )
      );
    });
  });
});
