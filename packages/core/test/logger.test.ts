import { createMidwayLogger, EmptyFramework, LightFramework } from '../src';
import { MidwayContextLogger } from '@midwayjs/logger';
import { join } from 'path';
import * as mm from 'mm';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

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

  it('should create log in serverless environment', async () => {
    const tmpLogsDir = join(tmpdir(), Date.now() + '-' + (Math.random() * 100000).toString().slice(-5));
    mm(process.env, 'MIDWAY_LOGGER_WRITEABLE_DIR', tmpLogsDir);
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: join(
        __dirname,
        './fixtures/base-app/src'
      ),
    });
    const logger = framework.getCoreLogger();
    logger.info('hello world');
    logger.debug('hello world');
    logger.warn('hello world');
    logger.error('hello world');
    expect(existsSync(join(tmpLogsDir, 'logs'))).toBeTruthy();
    mm.restore();
  });
});
