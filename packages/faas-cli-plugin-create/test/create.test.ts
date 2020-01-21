import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { join } from 'path';
import { remove, existsSync, readFileSync } from 'fs-extra';
import { TestCreatePlugin } from './helper';
import * as assert from 'assert';

describe('/test/create.test.ts', () => {
  const baseDir = join(__dirname, './tmp');
  beforeEach(async () => {
    if (existsSync(baseDir)) {
      await remove(baseDir);
    }
  });
  it('base create faas boilerplate', async () => {
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['create'],
      service: loadSpec(baseDir),
      provider: 'aliyun',
      options: {
        template: 'faas-standard',
        path: 'my_serverless',
      },
      log: console,
    });
    core.addPlugin(TestCreatePlugin);
    await core.ready();
    await core.invoke(['create']);
    assert(existsSync(join(baseDir, 'my_serverless/f.yml')));
    assert(existsSync(join(baseDir, 'my_serverless/src')));
    assert(existsSync(join(baseDir, 'my_serverless/test')));
    assert(existsSync(join(baseDir, 'my_serverless/tsconfig.json')));
    assert(existsSync(join(baseDir, 'my_serverless/package.json')));
    const contents = readFileSync(
      join(baseDir, 'my_serverless/f.yml'),
      'utf-8'
    );
    assert(/serverless-hello-world/.test(contents));
    await remove(baseDir);
  });

  it('base create from remote npm name', async () => {
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['create'],
      service: loadSpec(baseDir),
      provider: 'aliyun',
      options: {
        'template-package': '@midwayjs/faas-boilerplate-standard',
        'path': 'my_serverless',
      },
      log: console,
    });
    core.addPlugin(TestCreatePlugin);
    await core.ready();
    await core.invoke(['create']);
    assert(existsSync(join(baseDir, 'my_serverless/f.yml')));
    assert(existsSync(join(baseDir, 'my_serverless/src')));
    assert(existsSync(join(baseDir, 'my_serverless/test')));
    assert(existsSync(join(baseDir, 'my_serverless/tsconfig.json')));
    assert(existsSync(join(baseDir, 'my_serverless/package.json')));
    const contents = readFileSync(
      join(baseDir, 'my_serverless/f.yml'),
      'utf-8'
    );
    assert(/serverless-hello-world/.test(contents));
    await remove(baseDir);
  });
});
