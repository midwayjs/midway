import { invoke } from '../src/plugins/invoke/main';
// import * as assert from 'assert';
describe('/test/invoke.test.ts', () => {
  it('default invoke', async () => {
    await invoke({
      functionDir: __dirname,
      functionName: 'index'
    });
  });
});
