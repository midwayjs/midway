import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { AliyunFCPlugin } from '../../faas-cli-plugin-fc/src/index';
import { resolve } from 'path';
import { remove } from 'fs-extra';
import { transform } from '@midwayjs/serverless-spec-builder';
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
      await core.ready();
      await core.invoke(['package']);
      const yaml = transform(resolve(buildDir, 'template.yml'));
      assert(yaml.Resources['serverless-midway-test']['service'].Properties.Handler === 'service.handler');
    });
  });
});
