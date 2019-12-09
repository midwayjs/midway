import assert = require('assert');
import { EnvPropertyParser } from '../../src/lib/parser';

describe('parser.test.ts', () => {
  it('should test getProperty', () => {
    const parser = new EnvPropertyParser();
    const path = parser.getProperty('path');
    assert(path);
  });

  it('should test setProperty', () => {
    const parser = new EnvPropertyParser();
    parser.setProperty('hello', 'world');
    const res = parser.getProperty('HELLO');
    assert(res, 'world');
  });

  it('should getFunctionRuntime', () => {
    const parser = new EnvPropertyParser();
    const res = parser.getFunctionRuntime();
    assert(res, 'function_runtime');
  });

  it('should getEntryDir', () => {
    const parser = new EnvPropertyParser();
    const res = parser.getEntryDir();
    assert(res, process.cwd());
  });

  it('should getTriggerType', () => {
    const parser = new EnvPropertyParser();
    const res = parser.getTriggerType();
    assert(res, 'default_trigger');
  });

  it('should getFunctionLayer', () => {
    const parser = new EnvPropertyParser();
    const res = parser.getFunctionLayer() as string;
    assert(res.length === 0);
  });
});
