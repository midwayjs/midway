import { Framework } from '../src';
import { join } from 'path';
import { clearAllLoggers } from '@midwayjs/logger';

describe('/test/singleProcess.test.ts', function () {

  it('should create framework and get logger', async () => {
    clearAllLoggers();
    const framework = new Framework().configure({});
    await framework.initialize({
      appDir: join(__dirname, './fixtures/enhance/base-app')
    });

    const logger = framework.getLogger();
    expect(logger).toBeDefined();

    const coreLogger = framework.getLogger('coreLogger');
    expect(coreLogger).toBeDefined();

    const customLogger = framework.createLogger('customLogger', {
      disableFile: true,
      disableError: true
    });

    const customLoggerOther = framework.getLogger('customLogger');

    expect(customLoggerOther).toBeDefined();
    expect(customLoggerOther).toEqual(customLogger);

    expect(framework.getProjectName()).toEqual('ali-demo');
  });
});
