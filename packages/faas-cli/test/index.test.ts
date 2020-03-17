import { execSync } from 'child_process';
import { join } from 'path';
import { remove, existsSync, readFileSync, mkdirSync } from 'fs-extra';
import * as assert from 'assert';

describe('/test/create.test.ts', () => {
  const baseDir = join(__dirname, './tmp');
  beforeEach(async () => {
    if (existsSync(baseDir)) {
      await remove(baseDir);
    }
    mkdirSync(baseDir);
  });
  it('base create faas boilerplate', async () => {
    execSync(
      `cd ${baseDir};${join(
        __dirname,
        '../bin/fun.js'
      )} create --template faas-standard --path my_serverless`
    );
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
