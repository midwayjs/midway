import { generateFunctionsSpec } from '../src/fc';
import * as path from 'path';
import * as assert from 'assert';

describe.only('/test/fc.test.ts', () => {
  it('test base', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-base.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {});
  });

  it('test http events', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-event-http.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {
      'http-index': {
        Properties: {
          AuthType: 'ANONYMOUS',
          Methods: ['GET'],
        },
        Type: 'HTTP',
      },
    });
  });

  it('test http events no method', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-event-http-no-method.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {
      'http-index': {
        Properties: {
          AuthType: 'ANONYMOUS',
          Methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        },
        Type: 'HTTP',
      },
    });
  });
});
