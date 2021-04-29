import {
  MidwayDelegateLogger,
  MidwayBaseLogger,
  clearAllLoggers,
  createConsoleLogger,
  createFileLogger,
  createLogger,
  IMidwayLogger,
  loggers,
  format,
  displayCommonMessage,
  EmptyTransport,
  ILogger,
  MidwayContextLogger,
} from '../src';
import { join } from 'path';
import {
  fileExists,
  includeContent,
  removeFileOrDir,
  sleep,
  createChildProcess,
  finishLogger,
  matchContentTimes,
  getCurrentDateString
} from './util';
import { EggLogger } from 'egg-logger';
import { readFileSync, writeFileSync } from 'fs';
import * as os from 'os';

describe('/test/index.test.ts', () => {
  it('should test create logger', async () => {
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const coreLogger = new MidwayBaseLogger({
      dir: logsDir,
    });

    expect(coreLogger.getConsoleLevel()).toEqual('silly');
    expect(coreLogger.getFileLevel()).toEqual('silly');

    coreLogger.info('hello world1');
    coreLogger.info('hello world2');
    coreLogger.info('hello world3');
    coreLogger.warn('hello world4');
    coreLogger.error('hello world5');
    // 调整完之后控制台应该看不见了，但是文件还写入

    coreLogger.updateConsoleLevel('warn');
    expect(coreLogger.getConsoleLevel()).toEqual('warn');
    coreLogger.info('hello world6');
    coreLogger.info('hello world7');
    coreLogger.info('hello world8');

    // 文件也不会写入了
    coreLogger.updateFileLevel('warn');
    expect(coreLogger.getFileLevel()).toEqual('warn');
    coreLogger.info('hello world9');
    coreLogger.info('hello world10');
    coreLogger.info('hello world11');

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

    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world6')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world7')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world8')).toBeTruthy();

    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world9')).toBeFalsy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world10')).toBeFalsy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world11')).toBeFalsy();

    // test error logger  file include content
    expect(includeContent(join(logsDir, 'common-error.log'), 'hello world1')).toBeFalsy();
    expect(includeContent(join(logsDir, 'common-error.log'), 'hello world5')).toBeTruthy();

    // test default eol
    expect(includeContent(join(logsDir, 'midway-core.log'), os.EOL)).toBeTruthy();
    expect(includeContent(join(logsDir, 'common-error.log'), os.EOL)).toBeTruthy();

    coreLogger.close();
    await removeFileOrDir(logsDir);
  });

  it('should create logger in cluster mode', async ()  => {
    const logsDir = join(__dirname, 'fixtures/logs');
    await removeFileOrDir(logsDir);
    const clusterFile = join(__dirname, 'fixtures/cluster.ts');
    const child = createChildProcess(clusterFile);
    const pidList = await new Promise<any>(resolve => {
      child.on('message', (pidList) => {
        resolve(pidList);
      });
    });

    await new Promise<void>((resolve) => {
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

  it('should create custom logger and output content', async () =>{
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = new MidwayBaseLogger({
      dir: logsDir,
      fileLogName: 'custom-logger.log',
      disableError: true,
    });

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
    // format
    logger.error('format log, %j', {a: 1});
    // array
    logger.info([ 'Jack', 'Joe' ]);
    // set
    logger.info(new Set([2, 3, 4]));
    // map
    logger.info(new Map([['key1', 'value1'], ['key2', 'value2']]));
    // warn object
    logger.warn({ name: 'Jack' });
    // error object
    logger.error(new Error('error instance'));
    // named error
    const error = new Error('named error instance');
    error.name = 'NamedError';
    // 直接输出 error
    logger.error(error);
    // 文本在前，加上 error 实例
    logger.info([1,2,3]);
    logger.info(new Error('info - error instance'));
    logger.info('info - text before error', new Error('error instance after text'));
    logger.error('error - text before error', new Error('error instance after text'));


    await finishLogger(logger);

    expect(fileExists(join(logsDir, 'custom-logger.log'))).toBeTruthy();
    expect(fileExists(join(logsDir, 'common-error.log'))).toBeFalsy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'test')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[a:b] hello world')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[UserService] warn: hello world')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'aaa 222')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'plain error message')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '123')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[ \'b\', \'c\' ]')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '{ 2, 3, 4 }')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '{ \'key1\' => \'value1\', \'key2\' => \'value2\' }')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'plain error message')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'format log, {"a":1}')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[ \'Jack\', \'Joe\' ]')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), '[object Object]')).toBeTruthy();
    // error
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'NamedError: named error instance')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'info - text before error')).toBeTruthy();
    expect(includeContent(join(logsDir, 'custom-logger.log'), 'error - text before error')).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it('should create console file', async () => {
    await removeFileOrDir(join(process.cwd(), 'common-error.log'));
    const consoleLogger = createConsoleLogger('consoleLogger');
    consoleLogger.error('test console error');
    console.log('---');
    const err = new Error('custom error');
    err.name = 'MyCustomError';
    consoleLogger.error(err);
    consoleLogger.error(err, { label: 123});
    consoleLogger.error('before:', err);
    console.log('---');
    consoleLogger.info('启动耗时 %d ms', 111);
    consoleLogger.info('%j', {a: 1});
    consoleLogger.debug('1', '2', '3');
    consoleLogger.info('plain error message', 321);

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

  it('should create logger use different options', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
      disableError: true,
      defaultMeta: {
        name: 'my-site',
        group: 'my-group',
      },
      printFormat: info => {
        return `${info.group}.${info.name} ${info.level} ${info.message}`
      }
    });

    // 用户的 meta 优先级更高
    logger.error('first message', new Error('my error'), {
      group: 'bbb'
    });

    logger.updateDefaultMeta({
      name: 'my-another-site',
      group: 'my-another-group'
    });

    logger.error('second message', new Error('my error'));

    await sleep();
    expect(fileExists(join(logsDir, 'test-logger.log'))).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'bbb.my-site error first message my error')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), 'my-another-group.my-another-site error second message Error: my error')).toBeTruthy();

    const customFormatLogger = createLogger<IMidwayLogger>('testLogger1', {
      dir: logsDir,
      fileLogName: 'test-logger1.log',
      disableError: true,
      defaultMeta: {
        name: 'my-site',
        group: 'my-group',
      },
      format: format.combine(
        displayCommonMessage(),
        format.json()
      ),
    });

    customFormatLogger.info(123);
    customFormatLogger.error({
      user: 123,
      msg: {
        data: 'hello',
      },
    });
    await sleep();
    expect(fileExists(join(logsDir, 'test-logger1.log'))).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger1.log'), '{"message":123,"level":"info"')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger1.log'), '{"message":{"user":123,"msg":{"data":"hello"}},"level":"error"')).toBeTruthy();

    await removeFileOrDir(logsDir);
  });

  it('should create logger with no symlink', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const timeFormat = getCurrentDateString();
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
      errorLogName: 'test-error.log',
      disableErrorSymlink: true,
      disableFileSymlink: true,
    });

    logger.error('test console error');

    await sleep();
    expect(fileExists(join(logsDir, 'test-logger.log'))).toBeFalsy();
    expect(fileExists(join(logsDir, 'test-error.log'))).toBeFalsy();
    expect(fileExists(join(logsDir, 'test-logger.log.' + timeFormat))).toBeTruthy();
    expect(fileExists(join(logsDir, 'test-error.log.'+ timeFormat))).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log.' + timeFormat), `ERROR ${process.pid} test console error`)).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log.' + timeFormat), `ERROR ${process.pid} test console error`)).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it('should create logger with label', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      defaultLabel: 'main label',
      fileLogName: 'test-logger.log',
      errorLogName: 'test-error.log',
    });

    logger.error('test console error');
    logger.updateDefaultLabel('sandbox');
    logger.info('test change label');

    await sleep();
    expect(fileExists(join(logsDir, 'test-logger.log'))).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), '[main label] test console error')).toBeTruthy();
    expect(includeContent(join(logsDir, 'test-logger.log'), '[sandbox] test change label')).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it('should test container and create same logger', async () => {
    if (loggers.size > 0) {
      clearAllLoggers();
    }
    const logger1 = createConsoleLogger('consoleLogger');
    createConsoleLogger('anotherConsoleLogger');
    const logger3 = createConsoleLogger('consoleLogger');
    expect(logger1).toEqual(logger3);
    expect(loggers.size).toEqual(2);
    clearAllLoggers();
    expect(loggers.size).toEqual(0);
  });

  it('should test container with add logger', function () {
    if (loggers.size > 0) {
      clearAllLoggers();
    }
    const originLogger: any = createConsoleLogger('consoleLogger');
    expect(loggers.size).toEqual(1);
    const logger = new MidwayBaseLogger({
      disableError: true,
      disableFile: true
    });
    // 重复添加会报错
    expect(() => {
      loggers.addLogger('consoleLogger', logger);
    }).toThrow();
    expect(loggers.size).toEqual(1);
    let consoleLogger: ILogger = loggers.getLogger('consoleLogger');
    expect(originLogger).toEqual(consoleLogger);

    // 允许重复添加，且直接返回原对象
    loggers.addLogger('consoleLogger', originLogger, false);
    expect(loggers.size).toEqual(1);
    consoleLogger = loggers.getLogger('consoleLogger');
    expect(originLogger).toEqual(consoleLogger);

    // 允许重复添加，且替换原来的对象
    loggers.addLogger('consoleLogger', logger, false);
    expect(loggers.size).toEqual(1);
    consoleLogger = loggers.getLogger('consoleLogger');
    expect(logger).toEqual(consoleLogger);

    loggers.close('consoleLogger');
    expect(loggers.size).toEqual(0);
  });

  it('should create container with options and add logger', async () => {
    clearAllLoggers();
    loggers.updateContainerOption({
      level: 'warn',
      disableFile: true,
      disableError: true,
    })
    const customLogger: any = loggers.createLogger('customLogger', {
      level: 'info',
      dir: __dirname,
      fileLogName: 'custom.log',
    });
    customLogger.info('11111');
    customLogger.warn('222');
    await sleep();
    expect(!fileExists(join(__dirname, 'custom.log'))).toBeTruthy();
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

    // logger.enableFile();
    // logger.enableError();
    //
    // logger.warn('test console info4');
    // logger.error('test console error4');
    // await sleep();
    // expect(includeContent(join(logsDir, 'test-error.log'), 'test console error4')).toBeTruthy();
    // expect(includeContent(join(logsDir, 'test-logger.log'), 'test console error4')).toBeTruthy();
    // expect(includeContent(join(logsDir, 'test-logger.log'), 'test console info4')).toBeTruthy();

    await removeFileOrDir(logsDir);
  });

  it('should test common-error log', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger1 = createLogger<IMidwayLogger>('logger', {
      dir: logsDir,
      disableFile: true,
    });

    const logger2 = createLogger<IMidwayLogger>('logger', {
      dir: logsDir,
      disableFile: true,
    });

    expect(logger1).toEqual(logger2);
    logger1.error('output error by logger1');
    logger2.error('output error by logger2');

    await sleep();

    expect(matchContentTimes(join(logsDir, 'common-error.log'), 'output error by logger1')).toEqual(1)
    expect(matchContentTimes(join(logsDir, 'common-error.log'), 'output error by logger2')).toEqual(1)
    await removeFileOrDir(logsDir);
  });

  it('should use write method to file', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('logger', {
      dir: logsDir,
      disableError: true,
    });
    logger.write('hello world');
    const buffer = Buffer.from('hello world', 'utf-8');
    logger.write(buffer);

    await sleep();
    expect(matchContentTimes(join(logsDir, 'midway-core.log'), process.pid.toString())).toEqual(0);
    expect(matchContentTimes(join(logsDir, 'midway-core.log'), 'hello world')).toEqual(2);
    await removeFileOrDir(logsDir);
  });

  it('should custom transport', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);

    class CustomTransport extends EmptyTransport {
      log(info, callback) {
        const levelLowerCase = info.level;
        if (levelLowerCase === 'error' || levelLowerCase === 'warn') {
          writeFileSync(join(logsDir, 'test.log'), info.message);
        }
        callback();
      }
    }

    const logger = createLogger<IMidwayLogger>('logger', {
      dir: logsDir,
      disableError: true,
      level: 'info',
    });

    expect(logger.isEnableConsole()).toBeTruthy();
    expect(logger.isEnableFile()).toBeTruthy();
    expect(logger.isEnableError()).toBeFalsy();

    const customTransport = new CustomTransport({
      level: 'warn'
    });
    logger.add(customTransport);
    logger.info('hello world info');
    logger.warn('hello world warn');
    logger.remove(customTransport);
    logger.warn('hello world another warn');
    await sleep();

    expect(matchContentTimes(join(logsDir, 'midway-core.log'), 'hello world info')).toEqual(1);
    expect(matchContentTimes(join(logsDir, 'midway-core.log'), 'hello world warn')).toEqual(1);
    expect(matchContentTimes(join(logsDir, 'midway-core.log'), 'hello world another warn')).toEqual(1);

    expect(matchContentTimes(join(logsDir, 'test.log'), 'hello world info')).toEqual(0);
    expect(matchContentTimes(join(logsDir, 'test.log'), 'hello world warn')).toEqual(1);
    expect(matchContentTimes(join(logsDir, 'test.log'), 'hello world another warn')).toEqual(0);

    await removeFileOrDir(logsDir);
  });

  it('should test contextLogger', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const logger = createLogger<IMidwayLogger>('testLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
      disableError: true,
      printFormat: (info) => {
        return info.ctx.data + ' ' + info.message;
      }
    });

    const ctx = {data: 'custom data'};
    const contextLogger = new MidwayContextLogger(ctx, logger);

    contextLogger.info('hello world');
    contextLogger.debug('hello world');
    contextLogger.warn('hello world');
    contextLogger.error('hello world');
    contextLogger.log('hello world');
    contextLogger.log('info', 'hello world');

    await removeFileOrDir(logsDir);
  });

  it('should test createFileLogger', async () => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);

    const logger = createFileLogger('file', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
    });

    logger.info('file logger');
    await sleep();

    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'file logger')).toEqual(1);

    await removeFileOrDir(logsDir);

  });

  it('should dynamic change info data', async  ()  => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);

    const logger = createFileLogger('file', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
    });

    (logger as IMidwayLogger).updateTransformableInfo(info => {
      info.timestamp = 'bbbb';
      return info
    });
    logger.info('file logger');
    logger.info('file logger1');
    logger.info('file logger2');
    await sleep();

    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'bbbb')).toEqual(3);

    await removeFileOrDir(logsDir);
  });

  it.skip('should test container set level and disable api', async () => {
    if (loggers.size > 0) {
      clearAllLoggers();
    }
    const logger1 = createConsoleLogger('consoleLogger');
    loggers.disableConsole();
    // 后面的控制台输出应该都看不见
    logger1.info('aaaa');
    const logger2 = createConsoleLogger('anotherConsoleLogger');
    logger2.info('bbbb');

    // 恢复输出
    loggers.restore();
    logger1.info('cccc');
    logger2.info('dddd');

    clearAllLoggers();

    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);

    const logger3 = createFileLogger('fileLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
    });

    loggers.disableFile();
    // 后面的文件应该不存在
    logger3.info('aaaa');
    const logger4 = createFileLogger('anotherFileLogger', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
    });
    logger4.info('bbbb');

    await sleep();
    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'aaaa')).toEqual(0);
    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'bbbb')).toEqual(0);

    // 恢复输出
    loggers.restore();
    logger3.info('eeee');
    logger4.info('ffff');

    await sleep(2000);

    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'eeee')).toEqual(1);
    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'ffff')).toEqual(1);

    await removeFileOrDir(logsDir);

  });

  it('should change eol', async  ()  => {
    clearAllLoggers();
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);

    const logger = createFileLogger('file', {
      dir: logsDir,
      fileLogName: 'test-logger.log',
      eol: 'bbb\n'
    });

    logger.info('file logger');
    logger.info('file logger1');
    logger.info('file logger2');
    await sleep();

    expect(matchContentTimes(join(logsDir, 'test-logger.log'), 'bbb\n')).toEqual(3);

    await removeFileOrDir(logsDir);
  });

});
