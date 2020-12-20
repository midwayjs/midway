import { MidwayDelegateLogger, MidwayBaseLogger, clearAllLoggers, createConsoleLogger, createLogger, IMidwayLogger, loggers } from '../src';
import { join } from 'path';
import { fileExists, includeContent, removeFileOrDir, sleep, createChildProcess, finishLogger } from './util';
import { EggLogger } from 'egg-logger';
import { readFileSync } from "fs";

describe('/test/index.test.ts', () => {
  it('should test create logger', async () => {
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const coreLogger = new MidwayBaseLogger({
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

    coreLogger.close();
    await removeFileOrDir(logsDir);
  });

  it('should create logger in cluster mode', async ()  => {
    const logsDir = join(__dirname, 'fixtures/logs');
    await removeFileOrDir(logsDir);
    const clusterFile = join(__dirname, 'fixtures/cluster.ts');
    const child = createChildProcess(clusterFile);
    const pidList: [] = await new Promise(resolve => {
      child.on('message', (pidList) => {
        resolve(pidList);
      });
    });

    await new Promise((resolve) => {
      child.on('exit', () => {
        // 等进程退出
        resolve();
      });
    })
    // test logger file exist
    expect(fileExists(join(logsDir, 'midway-core.log'))).toBeTruthy();
    console.log(join(logsDir, 'midway-core.log'));
    console.log(readFileSync(join(logsDir, 'midway-core.log'), {
      encoding: 'utf8'
    }));

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
    const coreLogger = new MidwayDelegateLogger({
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

    coreLogger.close();
    await removeFileOrDir(logsDir);
  });

  it.only('should create custom logger and output content', async () =>{
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = new MidwayBaseLogger({
      dir: logsDir,
      fileLogName: 'custom-logger.log',
      disableError: true,
    });

    expect(fileExists(join(logsDir, 'custom-logger.log'))).toBeTruthy();
    expect(fileExists(join(logsDir, 'common-error.log'))).toBeFalsy();

    logger.debug('test');
    logger.info('hello world', { label: ['a', 'b']});
    logger.warn('warn: hello world', {label: 'UserService'});
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
    // !!!!Breaking Change
    logger.error('text before error: ', new Error('error instance after text'));
    logger.error('format log, %j', {a: 1});
    logger.info([ 'Jack', 'Joe' ]);
    logger.warn({ name: 'Jack' });

    await finishLogger(logger);

    expect(includeContent(join(logsDir, 'custom-logger.log'), 'test')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[a:b] hello world')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[UserService] warn: hello world')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'aaa 222')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'plain error message')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '123')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'b,c')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'plain error message')).toBeTruthy();
    // expect(includeContent(join(logsDir, 'custom-logger.log'), 'at Object.<anonymous>')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'NamedError: named error instance')).toBeTruthy();
    // !!!!Breaking Change
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'text before error')).toBeFalsy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'format log, {"a":1}')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'Jack,Joe')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[object Object]')).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it('should create console file', async () => {
    await removeFileOrDir(join(process.cwd(), 'common-error.log'));
    const consoleLogger = createConsoleLogger('consoleLogger');
    consoleLogger.error('test console error');

    expect(fileExists(join(process.cwd(), 'common-error.log'))).toBeFalsy();
  });

  it('should create logger and update configure', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
      disableFile: true,
      disableError: true,
    });

    logger.error(new Error('test error'));
    await sleep();
    expect(fileExists(join(logsDir, 'test-logger.log'))).toBeFalsy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test error')).toBeFalsy();

    logger.enableFile();
    logger.error(new Error('another test error'));
    logger.info('this is a info message with empty label', { label: []})
    logger.info('this is a info message with empty value label', { label: ''})
    logger.info('this is a info message with value label', { label: 'ddd'})
    logger.info('this is a info message with array value label', { label: ['ccc', 'aaa']})

    await sleep();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'another test error')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'this is a info message with empty label')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'this is a info message with empty label')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), '[ddd] this is a info message with value label')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), '[ccc:aaa] this is a info message with array value label')).toBeTruthy();

    await removeFileOrDir(logsDir);
  });

  it('should create logger with label', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      label: 'main label',
      fileLogName: 'test-logger.log',
      errorLogName: 'test-error.log',
    });

    logger.error('test console error');

    await sleep();
    expect(fileExists(join(logsDir, 'test-logger.log'))).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), '[main label] test console error')).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it('should test container and create same logger', async () => {
    if (loggers.size > 0) {
      clearAllLoggers();
    }
    const logger1 = createConsoleLogger('consoleLogger');
    createConsoleLogger('anotherConsoleLogger');
    const logger3 = createConsoleLogger('consoleLogger');
    expect(logger1).toBe(logger3);
    expect(loggers.size).toBe(2);
    clearAllLoggers();
    expect(loggers.size).toBe(0);
  });

  it('should test container with add logger', function () {
    if (loggers.size > 0) {
      clearAllLoggers();
    }
    const originLogger = createConsoleLogger('consoleLogger');
    expect(loggers.size).toBe(1);
    const logger = new MidwayBaseLogger({
      disableError: true,
      disableFile: true
    });
    expect(() => {
      loggers.addLogger('consoleLogger', logger);
    }).toThrow();

    expect(loggers.size).toBe(1);
    const consoleLogger: any = loggers.getLogger('consoleLogger');
    expect(originLogger).toBe(consoleLogger);
    loggers.close('consoleLogger');
    expect(loggers.size).toBe(0);
  });

  it('should create logger update level', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
      errorLogName: 'test-error.log',
    });

    logger.disableConsole();

    logger.info('test console info');
    logger.error('test console error');

    await sleep();
    expect(fileExists(join(logsDir, 'test-error.log'))).toBeTruthy();
    expect(fileExists(join(logsDir, 'test-logger.log'))).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-error.log'), 'test console error')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test console error')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test console info')).toBeTruthy();

    // after update level

    logger.updateLevel('warn');

    logger.info('test console info2');
    logger.error('test console error2');

    await sleep();
    expect(includeContent(join(logsDir, 'test-error.log'), 'test console error2')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test console error2')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test console info2')).toBeFalsy();

    // after disable error and file

    logger.disableError();
    logger.disableFile();

    logger.info('test console info3');
    logger.error('test console error3');
    await sleep();
    expect(includeContent(join(logsDir, 'test-error.log'), 'test console error3')).toBeFalsy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test console error3')).toBeFalsy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'test console info3')).toBeFalsy();


    await removeFileOrDir(logsDir);
  });

});
