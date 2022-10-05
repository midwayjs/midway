import { FileUtils } from '../../../src'
import { join } from 'path';

describe('/test/util/fs.test.ts', function () {
  it('should test MS constants', async () => {
    expect(await FileUtils.exists(__dirname)).toBeTruthy();
    expect(await FileUtils.exists(join(__dirname, '.tmp'))).toBeFalsy();
  });
});
