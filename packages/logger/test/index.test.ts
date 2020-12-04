import { createFrameworkLogger } from '../src/logger';

describe('/test/index.test.ts', () => {
  it('should test create logger', () => {
    const coreLogger = createFrameworkLogger({
      dir: __dirname,
    });
    coreLogger.info('hello world');
    coreLogger.info('hello world');
    coreLogger.info('hello world');
    coreLogger.info('hello world');
    coreLogger.error('hello world');
  });
});
