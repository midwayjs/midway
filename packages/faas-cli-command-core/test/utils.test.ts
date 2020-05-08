import { loadSpec, writeToSpec } from '../src/utils/loadSpec';
import { commandLineUsage } from '../src/utils/commandLineUsage';
import * as assert from 'assert';
import { tmpdir } from 'os';
describe('/test/utils.test.ts', () => {
  it('loadSpec', async () => {
    const spec = loadSpec(__dirname);
    assert(spec && spec.provider && spec.provider.name === 'ginkgo');
  });
  it('writeToSpec', async () => {
    const result: any = writeToSpec(tmpdir(), {});
    assert(Object.keys(result).length === 0);
    const spec = loadSpec(__dirname);
    writeToSpec(__dirname, spec);
  });
  it('commandLineUsage', async () => {
    const result = commandLineUsage({
      optionList: [
        {
          alias: 't',
          name: 'test',
        },
      ],
    });
    assert(/-t, --test/.test(result));
  });
});
