import { compareFileChange, copyFiles } from '../src/utils';
import * as assert from 'assert';
import { writeFileSync, existsSync, remove } from 'fs-extra';
import { resolve } from 'path';
describe('/test/utils.test.ts', () => {
  it('compareFileChange', async () => {
    const timeout = (fileName: string) => {
      return new Promise(res => {
        setTimeout(() => {
          writeFileSync(resolve(__dirname, fileName), `${Date.now()}`);
          res(true);
        }, 100);
      });
    };
    await timeout('./fixtures/files/tmp/1.from');
    await timeout('./fixtures/files/tmp/1.to');
    await timeout('./fixtures/files/tmp/2.from');
    const result = await compareFileChange(
      ['./fixtures/files/tmp/*.from'],
      ['./fixtures/files/tmp/*.to'],
      { cwd: __dirname }
    );
    assert(result && result[0] === './fixtures/files/tmp/2.from');
  });

  it('copyFiles', async () => {
    const target = resolve(__dirname, './fixtures/files/to');
    await remove(target);
    await copyFiles({
      sourceDir: resolve(__dirname, './fixtures/files/from'),
      targetDir: resolve(__dirname, './fixtures/files/to'),
      exclude: ['1.json', 'files/a.ts'],
      include: ['*.txt', 'files/*'],
    });
    assert(existsSync(resolve(__dirname, target, '1.js')));
    assert(existsSync(resolve(__dirname, target, '1.txt')));
    assert(existsSync(resolve(__dirname, target, 'files/b.ts')));
  });
});
