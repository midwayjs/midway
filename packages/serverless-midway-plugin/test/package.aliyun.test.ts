import { execSync } from 'child_process';
import * as assert from 'assert';
import { remove, existsSync } from 'fs-extra';
import { join } from 'path';
const servicePath = join(__dirname, './deployAliyun');

describe('/test/package.aliyun.test.ts', () => {
  it('package', async () => {
    const zipPath = join(servicePath, 'serverless.zip');
    await remove(join(servicePath, '.serverless'));
    await remove(zipPath);
    await execSync(`cd ${servicePath};serverless package`);
    assert(existsSync(zipPath));
    await remove(zipPath);
  });
});
