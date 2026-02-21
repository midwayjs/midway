import { Configuration, Framework } from '../src';
import * as defaultConfig from '../src/config/config.default';

describe('hono component exports', () => {
  it('should export framework and configuration class', () => {
    expect(Framework).toBeDefined();
    expect(Configuration).toBeDefined();
  });

  it('should expose default hono config', () => {
    expect(defaultConfig.hono).toEqual({});
  });
});
