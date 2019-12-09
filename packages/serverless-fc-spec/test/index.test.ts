import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import { generateFunctionsSpec, generateFunctionsSpecFile } from '../src/index';
import { FCSpec } from '../src/interface';

describe('/test/index.test.ts', () => {
  it('test transform yml', () => {
    const result: FCSpec = generateFunctionsSpec(path.join(__dirname, './fixtures/serverless.yml'));
    assert(result.ROSTemplateFormatVersion);
    assert(result.Transform);
    assert(result.Resources);
    assert(result.Resources['serverless-hello-world']);
    assert(result.Resources['serverless-hello-world']['hello1'].Properties.hasOwnProperty('Timeout'));
    assert(result.Resources['serverless-hello-world']['hello1'].Properties.hasOwnProperty('InitializationTimeout'));
    assert(result.Resources['midwayjs.org']);
    assert(result.Resources['midwayjs.org']['Properties']['Protocol'] === 'HTTP');
  });

  it('test generate spce file', () => {
    generateFunctionsSpecFile(path.join(__dirname, './fixtures/fun.yml'));
    assert(fs.existsSync(path.join(__dirname, './fixtures/template.yml')));
    fs.unlinkSync(path.join(__dirname, './fixtures/template.yml'));
  });
});
