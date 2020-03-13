import { get } from '../src/utils';
import * as assert from 'assert';
import { resolve } from 'path';
import { fork } from 'child_process';
describe('/test/utils.test.ts', () => {
  it('get & set min', async () => {
    const child = fork(resolve(__dirname, './child_min.js'));
    const data: any = await get(child, 'testmin');
    assert(data.name === 123);
  });
  it('get & set max', async () => {
    const child = fork(resolve(__dirname, './child_max.js'));
    const data: any = await get(child, 'testmax');
    assert(data.length === 10000);
  });
});
