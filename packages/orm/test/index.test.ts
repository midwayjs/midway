import { invoke } from '@midwayjs/serverless-invoke';
import { join } from 'path';
import * as assert from 'assert';
import { existsSync, unlinkSync } from 'fs';

describe('/test/index.test.ts', () => {
  xit('should use one db', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn', 'default.sqlite'));
    process.env.MIDWAY_TS_MODE = 'true';
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/base-fn'),
      functionName: 'test1',
      data: [require('./http_meta.json')],
      clean: false
    });
    process.env.MIDWAY_TS_MODE = 'false';
    console.log('result.body', result);
    assert(result && result.body.indexOf('hello world') > -1);
    assert(result.body === 'hello world[[{"id":1,"name":"oneuser1"}],1]');
  });

  it('use two db in one config', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'default.sqlite'));
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'test.sqlite'));
    process.env.MIDWAY_TS_MODE = 'true';
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/base-fn-multiple-db'),
      functionName: 'test1',
      data: [require('./http_meta.json')],
      clean: false
    });
    process.env.MIDWAY_TS_MODE = 'false';
    console.log('result.body', result);
    assert(result && result.body.indexOf('hello world') > -1);
    assert(result.body === 'hello world[[{"id":1,"name":"oneuser1"}],1]');
  });
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

