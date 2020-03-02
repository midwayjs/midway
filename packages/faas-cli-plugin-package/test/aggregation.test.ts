import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { resolve } from 'path';
import { existsSync } from 'fs-extra';
import { transform } from '@midwayjs/serverless-spec-builder';
import * as assert from 'assert';

describe('/test/package.test.ts', () => {
  describe('integration project build', () => {
    it('aggregation package', async () => {
      const baseDir = resolve(__dirname, './fixtures/aggregation');
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
      await core.ready();
      await core.invoke(['package']);
      const ymlPath = resolve(baseDir, '.serverless/f.yml');
      assert(existsSync(ymlPath));
      const ymlData = transform(ymlPath);
      const funcNames = Object.keys(ymlData.functions);
      assert(funcNames.length === 4);
      assert(ymlData.functions.aggregationapi);
      assert(ymlData.functions.aggregationapi.events[0].http.path === '/api/*');
      assert(ymlData.functions.render2);
      assert(ymlData.functions.aggregationrenderNot2);
      assert(ymlData.functions.aggregationrenderNot2.events[0].http.path === '/*');
      assert(ymlData.functions.aggregationnormal);
      assert(ymlData.functions.aggregationnormal._allAggred.length === 2);
    });
  });
});
