import { MidwayFrameworkDelegateLogger, MidwayFrameworkLogger, Logger } from '../src';
import { join } from 'path';
import { fileExists, includeContent, removeFileOrDir, sleep, createChildProcess } from './util';
import { EggLogger } from 'egg-logger';

describe('/test/index.test.ts', () => {
  it('should test create logger', async () => {
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const coreLogger = new MidwayFrameworkLogger({
      dir: logsDir,
    });
    coreLogger.info('hello world1');
    coreLogger.info('hello world2');
    coreLogger.info('hello world3');
    coreLogger.info('hello world4');
    coreLogger.error('hello world5');

    await sleep();
    // test logger file exist
    expect(fileExists(join(logsDir, 'midway-core.log'))).toBeTruthy();
    expect(fileExists(join(logsDir, 'common-error.log'))).toBeTruthy();

    // test logger file include content
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world1')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world2')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world3')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world4')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world5')).toBeTruthy();

    // test error logger  file include content
    expect(includeContent(join(logsDir, 'common-error.log'), 'hello world1')).toBeFalsy();
    expect(includeContent(join(logsDir, 'common-error.log'), 'hello world5')).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it('should create logger in cluster mode', async ()  => {
    const logsDir = join(__dirname, 'fixtures/logs');
    const clusterFile = join(__dirname, 'fixtures/cluster.ts');
    const child = createChildProcess(clusterFile);
    const pidList: [] = await new Promise(resolve => {
      child.on('message', (pidList) => {
        resolve(pidList);
      });
    });
    await sleep(5000);
    child.kill();

    for (const pid of pidList) {
      expect(includeContent(join(logsDir, 'midway-core.log'), pid)).toBeTruthy();
    }

    await removeFileOrDir(logsDir);
  });

  it('should test delegate logger to other', async () => {
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const eggLogger = new EggLogger({
      file: join(logsDir, 'egg-logger.log'),
      level: 'WARN'
    });
    const coreLogger = new MidwayFrameworkDelegateLogger({
      delegateLogger: eggLogger,
    });

    eggLogger.info('hello egg1 from egg logger');
    eggLogger.warn('hello egg2 from egg logger');
    eggLogger.error('hello egg3 from egg logger');
    coreLogger.info('hello egg1 from winston');
    coreLogger.warn('hello egg2 from winston');
    coreLogger.error('hello egg3 from winston');
    eggLogger.close();

    // 日志输出大于 egg-logger 落盘时间
    await sleep(1000);

    expect(includeContent(join(logsDir, 'egg-logger.log'), 'hello egg1 from egg logger')).toBeFalsy();
    expect(includeContent(join(logsDir, 'egg-logger.log'), 'hello egg2 from egg logger')).toBeTruthy();
    expect(includeContent(join(logsDir, 'egg-logger.log'), 'hello egg3 from egg logger')).toBeTruthy();
    expect(includeContent(join(logsDir, 'egg-logger.log'), 'hello egg1 from winston')).toBeFalsy();
    expect(includeContent(join(logsDir, 'egg-logger.log'), 'hello egg2 from winston')).toBeTruthy();
    expect(includeContent(join(logsDir, 'egg-logger.log'), 'hello egg3 from winston')).toBeTruthy();

    await removeFileOrDir(logsDir);
  });

  it.only('should create custom logger and output content', function () {
    const logger = new Logger();

    logger.debug('test');
    logger.info('hello world');
    logger.warn('warn: hello world', {className: 'UserService'});

    logger.info('%s %d', 'aaa', 222);
    // string
    logger.error('plain error message');
    // number
    logger.error(123);
    // array
    logger.error(['b', 'c']);
    // string + number
    logger.error('plain error message', 321);
    // error object
    logger.error(new Error('error instance'));

    // named error
    const error = new Error('named error instance');
    error.name = 'NamedError';
    logger.error(error);
  });

});
