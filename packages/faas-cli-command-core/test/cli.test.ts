import { BaseCLI } from '../src/';
import * as assert from 'assert';
describe('/test/cli.test.ts', () => {
  it('help', async () => {
    const cli = new BaseCLI(['', '', '-h']);
    cli.loadRelativePlugin('./', './plugins/empty');
    await cli.start();
    assert(true);
  });
  it('test', async () => {
    const cli = new BaseCLI(['', '', 'test', '-h']);
    cli.cwd = __dirname;
    cli.loadRelativePlugin('./', './plugins/empty');
    await cli.start();
    assert(true);
  });
});
