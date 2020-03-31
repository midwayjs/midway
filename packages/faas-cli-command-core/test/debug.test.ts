import { waitDebug } from '../src';
import { exec} from 'child_process';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/debug.test.ts', () => {
  it('debug', (done) => {
    const port = 9229;
    const child = exec(`node ${join(__dirname, './debug.js')} --debug=${port} -h`, () => {});
    child.stdout.on('data', console.log);
    waitDebug(port).then(send => {
      assert(typeof send === 'function');
      done();
    });
  });
});
