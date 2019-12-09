import { execSync } from 'child_process';
import * as assert from 'assert';
import { join } from 'path';
const servicePath = join(__dirname, '../');

describe('/test/invokeAliyun/test/invoke.test.ts', () => {
  it('invoke rumtime:aliyun', async () => {
    const result = await execSync(`cd ${servicePath};serverless invoke -f index`);
    assert(/"hello world"/.test(result.toString()));
  });
});
