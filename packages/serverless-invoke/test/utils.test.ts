import { compareFileChange } from '../src/utils';
import * as assert from 'assert';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
describe('/test/utils.test.ts', () => {
  it('compareFileChange', async () => {
    const timeout = (fileName: string) => {
      return new Promise((res) => {
        setTimeout(() => {
          writeFileSync(resolve(__dirname, fileName), `${Date.now()}`);
          res(true);
        }, 100);
      });
    };
    await timeout('./fixtures/baseApp/tmp/1.from');
    await timeout('./fixtures/baseApp/tmp/1.to');
    await timeout('./fixtures/baseApp/tmp/2.from');
    const result = await compareFileChange(['./fixtures/baseApp/tmp/*.from'], ['./fixtures/baseApp/tmp/*.to'], { cwd: __dirname });
    assert(result && result[0] === './fixtures/baseApp/tmp/2.from');
  });
});
