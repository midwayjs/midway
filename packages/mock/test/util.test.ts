import { processArgsParser } from '../src';

describe('processArgsParser', () => {
  it('should parse --key value format correctly', () => {
    const argv = ['node', 'script.js', '--key', 'value'];
    const result = processArgsParser(argv);
    expect(result).toEqual({ key: 'value' });
  });

  it('should parse --key=value format correctly', () => {
    const argv = ['node', 'script.js', '--key=value'];
    const result = processArgsParser(argv);
    expect(result).toEqual({ key: 'value' });
  });

  it('should parse --key format correctly', () => {
    const argv = ['node', 'script.js', '--key'];
    const result = processArgsParser(argv);
    expect(result).toEqual({ key: true });
  });

  it('should handle multiple arguments correctly', () => {
    const argv = ['node', 'script.js', '--key1', 'value1', '--key2=value2', '--key3'];
    const result = processArgsParser(argv);
    expect(result).toEqual({ key1: 'value1', key2: 'value2', key3: true });
  });
});
