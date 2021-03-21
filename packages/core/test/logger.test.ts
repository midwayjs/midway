import { createMidwayLogger, EmptyFramework } from '../src';
import { MidwayContextLogger } from '@midwayjs/logger';
import { join } from 'path';

describe('/test/logger.test.ts', () => {
  it('should create context logger', async () => {
    const framework = new EmptyFramework();
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
