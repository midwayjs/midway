import { transform, SpecBuilder, generate } from '../src';
import * as path from 'path';
import * as assert from 'assert';
import * as fs from 'fs';

describe('/test/index.test.ts', () => {

  describe('test all format', () => {
    it('test transform yml', () => {
      const result = transform(path.join(__dirname, './fixtures/fun.yml'));
      assert(result['functions']['hello']['handler'] === 'index.handler');
    });

    it('test transform yaml', () => {
      const result = transform(path.join(__dirname, './fixtures/fun.yaml'));
      assert(result['functions']['hello']['handler'] === 'index.handler');
    });
  });

  describe('test custom builder', () => {
    it('test use custom builder', () => {

      class CustomBuilder extends SpecBuilder {

        getTest() {
          return {
            test: {
              hello: 'test'
            }
          };
        }

        toJSON() {
          return {
            ...this.getTest(),
          };
        }
      }

      const result = transform(path.join(__dirname, './fixtures/fun.yml'), CustomBuilder);
      assert(result['test']['hello'] === 'test');
    });
  });

  describe('test generate file', () => {
    it('test generate test.yml', () => {
      generate(path.join(__dirname, './fixtures/fun.yml'), 'test.yml');
      assert(fs.existsSync(path.join(__dirname, './fixtures/test.yml')));
      fs.unlinkSync(path.join(__dirname, './fixtures/test.yml'));
    });
  });

});
