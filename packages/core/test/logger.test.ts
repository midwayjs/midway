import { createMidwayLogger, MidwayContextLogger } from '../src';
import { MockFramework } from './util';
import { join } from 'path';

describe('/test/logger.test.ts', () => {
  it('should create context logger', async () => {
    const framework = new MockFramework();
    await framework.initialize({
      baseDir: join(
        __dirname,
        './fixtures/base-app/src'
      ),
    });
    const customLogger = createMidwayLogger(framework, 'customLogger', {
      disableError: true,
      disableFile: true
    });

    const ctx = {};
    const contextLogger = new MidwayContextLogger(ctx, customLogger);
    contextLogger.info('hello world');
    contextLogger.debug('hello world');
    contextLogger.warn('hello world');
    contextLogger.error('hello world');
    contextLogger.log('hello world');
    contextLogger.log('info', 'hello world');
  });
});
