import { invoke, getFuncList } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
import { remove } from 'fs-extra';
describe('/test/noyaml.test.ts', () => {
  it('getFuncList', async () => {
    const functionDir = join(__dirname, 'fixtures/noYaml');
    await remove(join(functionDir, './.faas_debug_tmp'));
    const result: any = await getFuncList({ functionDir });
    assert(result.service && result.service.handler === 'service.handler' && result['service2-index'].events[0].http.path === '/api/test2');
  });
  it('TrippleGetFuncList', async () => {
    const functionDir = join(__dirname, 'fixtures/noYaml');
    await remove(join(functionDir, './.faas_debug_tmp'));
    const result = await Promise.all([0, 1, 2].map(() => {
      return getFuncList({ functionDir });
    }));
    assert(result.length === 3 && result[2].service);
  });
  it('invoke', async () => {
    const functionDir = join(__dirname, 'fixtures/noYaml');
    await remove(join(functionDir, './.faas_debug_tmp'));
    const result: any = await invoke({
      functionDir,
      functionName: 'service'
    });
    assert(result.body === 'hello world');
  });
  it('doubleInvoke', async () => {
    const functionDir = join(__dirname, 'fixtures/noYaml');
    await remove(join(functionDir, './.faas_debug_tmp'));
    const result = await Promise.all([0, 1].map(() => {
      return invoke({
        functionDir,
        functionName: 'service'
      });
    }));
    assert(result.length === 2 && result[1].body === 'hello world');
  });
});
