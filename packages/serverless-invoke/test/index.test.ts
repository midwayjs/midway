import { invoke } from '../src';
import { join } from 'path';
import * as assert from 'assert';
import { existsSync, remove } from 'fs-extra';

describe('/test/index.test.ts', () => {
  afterEach(() => {
    process.env.MIDWAY_TS_MODE = undefined;
  });

  after(async () => {
    if (existsSync(join(__dirname, 'fixtures/ice-faas-ts-standard/.faas_debug_tmp'))) {
      await remove(join(__dirname, 'fixtures/ice-faas-ts-standard/.faas_debug_tmp'));
    }
  });

  it('should use origin http trigger', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      data: [{name: 'params'}],
      clean: false,
    });
    assert(existsSync(join(__dirname, 'fixtures/baseApp/.faas_debug_tmp')));
    assert(result && result.body === 'hello http world');
    await remove(join(__dirname, 'fixtures/baseApp/.faas_debug_tmp'));
  });

  it('should use origin http trigger in ice + faas demo by package options', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts-pkg-options'),
      functionName: 'test1',
      data: [{name: 'params'}],
    });
    assert(result && result.body === 'hello http world');
    await remove(join(__dirname, 'fixtures/ice-faas-ts-pkg-options/.faas_debug_tmp'));
  });

  it('should use origin http trigger in ice + faas demo by args, with incremental: false', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts-standard'),
      functionName: 'test1',
      data: [{name: 'params'}],
      sourceDir: 'src/apis',
      incremental: false,
    });
    assert(result && result.body === 'hello http world');
    await remove(join(__dirname, 'fixtures/ice-faas-ts-standard/.faas_debug_tmp'));
  });

  it('should use origin http trigger in ice + faas demo by args, with incremental: true, first', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts-standard'),
      functionName: 'test1',
      data: [{name: 'params'}],
      sourceDir: 'src/apis',
      incremental: true,
    });
    assert(result && result.body === 'hello http world');
  });

  it('should use origin http trigger in ice + faas demo by args, with incremental: true, second', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts-standard'),
      functionName: 'test1',
      data: [{name: 'params'}],
      sourceDir: 'src/apis',
      incremental: true,
    });
    assert(result && result.body === 'hello http world');
  });
});
