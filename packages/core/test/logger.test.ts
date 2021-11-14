import { MidwayContextLogger } from '@midwayjs/logger';
import { join } from 'path';
import * as mm from 'mm';
import { tmpdir } from 'os';
import { existsSync } from 'fs';
import { createLightFramework } from './util';
import { clearAllModule } from '@midwayjs/decorator';

describe('/test/logger.test.ts', () => {
  beforeEach(() => {
    clearAllModule();
  });

  it('should create context logger', async () => {
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/base-app/src'
    ));
    const customLogger = framework.createLogger('customLogger', {
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

    await framework.stop();
  });

  it('should create log in serverless environment', async () => {
    const tmpLogsDir = join(tmpdir(), Date.now() + '-' + (Math.random() * 100000).toString().slice(-5));
    mm(process.env, 'MIDWAY_LOGGER_WRITEABLE_DIR', tmpLogsDir);
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/base-app/src'
    ));
    const logger = framework.getCoreLogger();
    logger.info('hello world');
    logger.debug('hello world');
    logger.warn('hello world');
    logger.error('hello world');
    expect(existsSync(join(tmpLogsDir, 'logs'))).toBeTruthy();
    mm.restore();

    await framework.stop();
  });
});
