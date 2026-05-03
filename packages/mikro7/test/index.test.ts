import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';

const dirname = fileURLToPath(new URL('.', import.meta.url));

process.env.MIKRO7_FIXTURES_DIR = join(dirname, 'fixtures');

describe('/test/index.test.ts', () => {
  it('should test base entity', async () => {
    cleanFile(join(dirname, 'fixtures/base-fn-origin', 'test.sqlite'));
    const result = await runFixture('base');
    expect(result).toContain('b1');
  });

  it('test multi entity manager in different component', async () => {
    cleanFile(join(dirname, 'fixtures/multi-enitymanager', 'test.sqlite'));
    cleanFile(join(dirname, 'fixtures/multi-enitymanager', 'test1.sqlite'));
    const result = await runFixture('multi');
    expect(result).toEqual({
      m1: '[]',
      withEntity: '[]',
      home: '[[],[]]',
    });
  });
});

function runFixture(
  name: 'base' | 'multi'
): Promise<string | Record<string, string>> {
  return new Promise((resolve, reject) => {
    const child = fork(join(dirname, 'fixtures/check.cjs'), [name], {
      execArgv: ['-r', 'ts-node/register'],
      env: {
        ...process.env,
        MIKRO7_FIXTURES_DIR: join(dirname, 'fixtures'),
      },
    });

    child.on('message', message => {
      if (message && typeof message === 'object' && 'result' in message) {
        resolve(message.result as string | Record<string, string>);
      }
    });
    child.on('error', reject);
    child.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`fixture child exited with code ${code}`));
      }
    });
  });
}

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}
