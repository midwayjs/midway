import { loadSpec } from '../src/utils/loadSpec';
import * as assert from 'assert';
describe('/test/utils.test.ts', () => {
  it('loadSpec', async () => {
    const spec = loadSpec(__dirname);
    assert(spec && spec.provider && spec.provider.name === 'ginkgo');
  });
});
