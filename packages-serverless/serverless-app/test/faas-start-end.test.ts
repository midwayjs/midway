import { join } from 'path';
import * as assert from 'assert';
import { existsSync, remove } from 'fs-extra';
import { createApp, close } from '@midwayjs/mock';
import { Framework } from '../src';
import { createInitializeContext } from '../../serverless-fc-trigger';
import { FC } from '@midwayjs/faas-typings';

const cwd = join(__dirname, 'fixtures/faas-start-end');
describe('test/faas-start-end.test.ts', () => {

  if (/^v10/.test(process.version)) {
    it('skip node v10', () => {});
    return;
  }

  it('start and end', async () => {
    const readyFile = join(cwd, 'src/ready.txt');
    if (existsSync(readyFile)) {
      await remove(readyFile);
    }
    const app = await createApp<Framework>(cwd, {
      initContext: createInitializeContext() as FC.InitializeContext,
    }, require('../src'));

    assert(existsSync(readyFile));
    await remove(readyFile);
    const stopFile = join(cwd, 'src/stop.txt');
    if (existsSync(stopFile)) {
      await remove(stopFile);
    }
    await close(app);
    assert(existsSync(stopFile));
    await remove(stopFile);
  });
});
