import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { resolve, join } from 'path';
import { existsSync, remove } from 'fs-extra';
import * as assert from 'assert';

describe('/test/package.test.ts', () => {
  describe('package base midway faas project', () => {
    const baseDir = resolve(__dirname, './fixtures/base-app');

    afterEach(async () => {
      await remove(join(baseDir, 'serverless.zip'));
      await remove(join(baseDir, 'package-lock.json'));
      await remove(join(baseDir, '.serverless'));
      await remove(join(baseDir, 'node_modules'));
    });
    it.only('base package', async () => {
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
      const buildPath = join(baseDir, '.serverless');
      assert(existsSync(join(buildPath, 'dist/index.js')));
      assert(existsSync(join(buildPath, 'dist/a.html')));
      assert(existsSync(join(buildPath, 'dist/view/b.json')));
      assert(existsSync(join(buildPath, 'node_modules')));
      assert(existsSync(join(buildPath, 'src')));
      assert(existsSync(join(buildPath, 'package.json')));
      assert(existsSync(join(buildPath, 'copy.js')));
      assert(existsSync(join(buildPath, 'tsconfig.json')));
      assert(existsSync(resolve(baseDir, 'serverless.zip')));
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
          buildDir: 'userbuild',
          skipZip: true,
        },
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);

      const buildPath = join(baseDir, 'userbuild/.serverless');
      assert(existsSync(join(buildPath, 'dist/index.js')));
      assert(existsSync(join(buildPath, 'node_modules')));
      assert(existsSync(join(buildPath, 'src')));
      assert(existsSync(join(buildPath, 'package.json')));
      assert(existsSync(join(buildPath, 'tsconfig.json')));
      assert(!existsSync(resolve(baseDir, 'serverless.zip')));
      await remove(join(baseDir, 'userbuild'));
    });
  });

  it('use custom artifact directory', async () => {
    const baseDir = join(__dirname, './fixtures/base-app-pkg-config');
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
    assert(existsSync(join(buildPath, 'dist/index.js')));
    assert(existsSync(join(buildPath, 'node_modules')));
    assert(existsSync(join(buildPath, 'src')));
    assert(existsSync(join(buildPath, 'package.json')));
    assert(existsSync(join(buildPath, 'tsconfig.json')));
    assert(existsSync(join(buildPath, 'a.json')));
    assert(existsSync(join(buildPath, 'app/test.js')));
    assert(!existsSync(join(buildPath, 'b.json')));
    assert(existsSync(join(baseDir, 'path/to/my-artifact.zip')));

    // clean
    await remove(join(baseDir, 'path'));
  });

  it('build eaas function', async () => {
    const baseDir = join(__dirname, './fixtures/eaas');
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
    assert(existsSync(join(buildPath, 'app')));
    assert(existsSync(join(buildPath, 'node_modules')));
    assert(existsSync(join(buildPath, 'config')));
    assert(existsSync(join(buildPath, 'package.json')));
    assert(existsSync(join(buildPath, 'app.js')));
    assert(existsSync(join(buildPath, 'agent.js')));
    assert(existsSync(join(buildPath, 'index.js')));
    assert(existsSync(join(baseDir, 'serverless.zip')));

    // clean
    await remove(join(baseDir, '.serverless'));
  });

  describe('integration project build', () => {
    it('integration project build and use default shared target dir', async () => {
      const baseDir = resolve(__dirname, './fixtures/ice-faas-ts');
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {
          sourceDir: 'src/apis',
          sharedDir: 'share',
        },
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      // asserting function entry files exist
      assert(existsSync(resolve(baseDir, '.serverless/dist/apis/index.js')));
      // asserting files not in src/apis should
      assert(existsSync(resolve(baseDir, '.serverless/dist/util.js')));
      assert(existsSync(resolve(baseDir, '.serverless/static/render.html')));
      assert(existsSync(resolve(baseDir, '.serverless/static/common/a.js')));
      assert(existsSync(resolve(baseDir, 'serverless.zip')));
    });

    it('integration project build and use custom shared target dir', async () => {
      const baseDir = resolve(__dirname, './fixtures/ice-faas-ts');
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {
          sourceDir: 'src/apis',
          sharedDir: 'share',
          sharedTargetDir: 'shared',
        },
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      // asserting function entry files exist
      assert(existsSync(resolve(baseDir, '.serverless/dist/apis/index.js')));
      // asserting files not in src/apis should
      assert(existsSync(resolve(baseDir, '.serverless/dist/util.js')));
      assert(existsSync(resolve(baseDir, '.serverless/shared/render.html')));
      assert(existsSync(resolve(baseDir, '.serverless/shared/common/a.js')));
      assert(existsSync(resolve(baseDir, 'serverless.zip')));
    });
  });
});
