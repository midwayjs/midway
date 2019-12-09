import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  generateTemplateFunctionsSpec,
  generateTemplateFunctionsSpecFile,
  generateFunctionsSpec,
  generateFunctionsSpecFile,
} from '../src';
import { SCFFunctionSpec, SCFTemplateSpec } from '../src/interface/template';
import { SCFServerlessSpec } from '../src/interface/serverless';

describe('template.yml', () => {
  const root = path.resolve(__dirname, 'fixtures/template');

  it('test transform yml', () => {
    const result: SCFTemplateSpec = generateTemplateFunctionsSpec(
      path.join(root, 'serverless.yml')
    );
    assert(result.Globals);
    assert(result.Globals.Function.Environment);
    assert(result.Resources);
    assert(result.Resources.default);
    const func = result.Resources.default['hello1'] as SCFFunctionSpec;
    assert(func.Properties.hasOwnProperty('Timeout'));
  });

  it('test generate spce file', () => {
    generateTemplateFunctionsSpecFile(path.join(root, 'serverless.yml'));
    assert(fs.existsSync(path.join(root, 'template.yml')));
    fs.unlinkSync(path.join(root, 'template.yml'));
  });
});

describe('serverless.yml', () => {
  const root = path.resolve(__dirname, 'fixtures/serverless');

  it('test transform yml', () => {
    const result: SCFServerlessSpec = generateFunctionsSpec(
      path.join(root, 'serverless.yml')
    );
    assert(result.functions);
    assert(Array.isArray(result.plugins));
  });

  it('test generate spce file', () => {
    generateFunctionsSpecFile(path.join(root, 'serverless.yml'));
    assert(fs.existsSync(path.join(root, '.serverless/serverless.yml')));
    fs.unlinkSync(path.join(root, '.serverless/serverless.yml'));
    fs.rmdirSync(path.join(root, '.serverless'));
  });
});
