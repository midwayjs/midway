import { creatApp, closeApp, getFilepath, sleep, matchContentTimes } from './utils';
import * as mm from 'mm';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, ensureDir, remove, symlinkSync } from 'fs-extra';
import { lstatSync } from 'fs';
import { getCurrentDateString } from '../src/utils';

describe('test/logger.test.js', () => {

  afterEach(() => {
    mm.restore();
  });

  it('should output app logger and context logger with timestamp in console and file', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'local');
    mm(process.env, 'EGG_LOG', 'WARN');
    const logsDir = join(__dirname, 'fixtures/apps/mock-dev-app-logger/logs/ali-demo');
    await ensureDir(logsDir);
    const app = await creatApp('apps/mock-dev-app-logger', { cleanLogsDir: false});
    app.coreLogger.warn('custom content');

    // for test pandora collect
    for(const name of app.loggers.keys()) {
      const logger = app.loggers.get(name);
      for (const transport of logger.values()) {
        console.log((transport as any).options.file);
      }
    }

    app.createAnonymousContext().logger.warn('custom content in context');
    await sleep();
    const timeFormat = getCurrentDateString();
    expect(matchContentTimes(join(logsDir, 'midway-web.log'), timeFormat)).toEqual(1);
    await closeApp(app);
  });

  it('should remove symbol link created by midway logger when started', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'local');
    mm(process.env, 'EGG_LOG', 'ERROR');
    const logsDir = join(__dirname, 'fixtures/apps/mock-dev-app-egg-logger/logs/ali-demo');
    await remove(logsDir);
    await ensureDir(logsDir);

    writeFileSync(join(logsDir, 'base.log'), 'hello world');
    // 先创建一些软链
    symlinkSync(join(logsDir, 'base.log'), join(logsDir, 'common-error.log'));
    symlinkSync(join(logsDir, 'base.log'), join(logsDir, 'egg-schedule.log'));
    symlinkSync(join(logsDir, 'base.log'), join(logsDir, 'midway-agent.log'));
    symlinkSync(join(logsDir, 'base.log'), join(logsDir, 'midway-core.log'));
    symlinkSync(join(logsDir, 'base.log'), join(logsDir, 'midway-web.log'));
    const app = await creatApp('apps/mock-dev-app-egg-logger', {cleanLogsDir: false});
    app.coreLogger.error('aaaaa');
    expect(lstatSync(join(logsDir, 'common-error.log')).isSymbolicLink()).toBeFalsy();
    expect(lstatSync(join(logsDir, 'egg-schedule.log')).isSymbolicLink()).toBeFalsy();
    expect(lstatSync(join(logsDir, 'midway-agent.log')).isSymbolicLink()).toBeFalsy();
    expect(lstatSync(join(logsDir, 'midway-core.log')).isSymbolicLink()).toBeFalsy();
    expect(lstatSync(join(logsDir, 'midway-web.log')).isSymbolicLink()).toBeFalsy();
    await closeApp(app);
  });

  it('should backup egg logger file when start', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'local');
    mm(process.env, 'EGG_LOG', 'ERROR');
    const logsDir = join(__dirname, 'fixtures/apps/mock-dev-app/logs/ali-demo');
    await remove(logsDir);
    await ensureDir(logsDir);
    // 先创建一些文件
    writeFileSync(join(logsDir, 'common-error.log'), 'hello world');
    writeFileSync(join(logsDir, 'egg-schedule.log'), 'hello world');
    writeFileSync(join(logsDir, 'midway-agent.log'), '');
    writeFileSync(join(logsDir, 'midway-core.log'), 'hello world');
    writeFileSync(join(logsDir, 'midway-web.log'), 'hello world');
    const app = await creatApp('apps/mock-dev-app', { cleanLogsDir: false});
    app.coreLogger.error('aaaaa');
    const timeFormat = getCurrentDateString();
    // 备份文件存在
    expect(existsSync(join(logsDir, 'common-error.log.' + timeFormat + '_eggjs_bak'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'egg-schedule.log.' + timeFormat + '_eggjs_bak'))).toBeTruthy();
    // 这个文件被删了，不需要备份
    // expect(existsSync(join(logsDir, 'midway-agent.log.' + timeFormat + '_eggjs_bak'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-core.log.' + timeFormat + '_eggjs_bak'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-web.log.' + timeFormat + '_eggjs_bak'))).toBeTruthy();

    // 写入文件存在
    expect(existsSync(join(logsDir, 'common-error.log.' + timeFormat))).toBeTruthy();
    expect(existsSync(join(logsDir, 'egg-schedule.log.' + timeFormat))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-agent.log.' + timeFormat))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-core.log.' + timeFormat))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-web.log.' + timeFormat))).toBeTruthy();

    // 符号文件存在
    expect(existsSync(join(logsDir, 'common-error.log'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'egg-schedule.log'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-agent.log'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-core.log'))).toBeTruthy();
    expect(existsSync(join(logsDir, 'midway-web.log'))).toBeTruthy();

    // 是否是软链
    expect(lstatSync(join(logsDir, 'common-error.log')).isSymbolicLink()).toBeTruthy();
    expect(lstatSync(join(logsDir, 'egg-schedule.log')).isSymbolicLink()).toBeTruthy();
    expect(lstatSync(join(logsDir, 'midway-agent.log')).isSymbolicLink()).toBeTruthy();
    expect(lstatSync(join(logsDir, 'midway-core.log')).isSymbolicLink()).toBeTruthy();
    expect(lstatSync(join(logsDir, 'midway-web.log')).isSymbolicLink()).toBeTruthy();
    await closeApp(app);
  });

  it('should got right default config on prod env', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'prod');
    mm(process.env, 'EGG_LOG', '');
    mm(process.env, 'EGG_HOME', getFilepath('apps/mock-production-app/src/config'));
    await remove(join(getFilepath('apps/mock-production-app/src/config'), 'logs'));
    await remove(join(getFilepath('apps/mock-production-app'), 'logs'));
    const app = await creatApp('apps/mock-production-app');

    // 生产环境默认 _level = info
    expect((app.logger as any).fileTransport.level).toEqual('info');
    // stdout 默认 INFO
    expect((app.logger as any).consoleTransport.level).toEqual('info');
    expect((app.coreLogger as any).fileTransport.level).toEqual('info');
    expect((app.coreLogger as any).consoleTransport.level).toEqual('info');
    expect(app.config.logger.disableConsoleAfterReady === true);

    // 控制台看不见这个输出，但是文件中可以
    app.logger.info('just show once');
    app.logger.error('this is a test error');

    const middlewareLogger = app.getLogger('middlewareLogger');
    middlewareLogger.error('xxxxx');

    await sleep();

    // 自定义日志，打印一遍 error，会在自定义日志本身，以及 common-error 中出现
    expect(matchContentTimes(join(app.getAppDir(), 'logs/middleware.log'), 'xxxxx')).toEqual(1);
    expect(matchContentTimes(join(process.env.EGG_HOME, 'logs/ali-demo/common-error.log'), 'xxxxx')).toEqual(1);
    expect(matchContentTimes(join(process.env.EGG_HOME, 'logs/ali-demo/common-error.log'), 'just show once')).toEqual(0);
    expect(matchContentTimes(join(process.env.EGG_HOME, 'logs/ali-demo/common-error.log'), 'this is a test error')).toEqual(1);
    expect(matchContentTimes(join(process.env.EGG_HOME, 'logs/ali-demo/midway-web.log'), 'just show once')).toEqual(1);
    expect(matchContentTimes(join(process.env.EGG_HOME, 'logs/ali-demo/midway-web.log'), 'this is a test error')).toEqual(1);

    await closeApp(app);
  });

  it('should got right level on prod env when set allowDebugAtProd to true', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'prod');
    mm(process.env, 'EGG_LOG', '');
    mm(process.env, 'EGG_HOME', getFilepath('apps/mock-production-app-do-not-force/src/config'));
    await remove(join(getFilepath('apps/mock-production-app-do-not-force/src/config'), 'logs'));
    const app = await creatApp('apps/mock-production-app-do-not-force');

    expect(app.config.logger.allowDebugAtProd).toBeTruthy();

    expect((app.logger as any).fileTransport.level).toEqual('debug');
    expect((app.logger as any).consoleTransport.level).toEqual('info');
    expect((app.coreLogger as any).fileTransport.level).toEqual('debug');
    expect((app.coreLogger as any).consoleTransport.level).toEqual('info');

    // 由于 egg 默认设置了 disableConsoleAfterReady，所以控制台还是看不到这个输出
    app.logger.info('------');
    await closeApp(app);
  });

  it('should got right level on local env', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'local');
    mm(process.env, 'EGG_LOG', '');
    await remove(join(getFilepath('apps/mock-dev-app'), 'logs'));
    const app = await creatApp('apps/mock-dev-app');

    expect((app.logger as any).fileTransport.level === 'info');
    expect((app.logger as any).consoleTransport.level === 'info');
    expect((app.coreLogger as any).fileTransport.level === 'info');
    expect((app.coreLogger as any).consoleTransport.level === 'warn');
    expect(app.config.logger.disableConsoleAfterReady === false);
    await closeApp(app);
  });

  it('should set EGG_LOG level on local env', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'local');
    mm(process.env, 'EGG_LOG', 'ERROR');
    await remove(join(getFilepath('apps/mock-dev-app'), 'logs'));
    const app = await creatApp('apps/mock-dev-app');

    expect((app.logger as any).fileTransport.level === 'info');
    expect((app.logger as any).consoleTransport.level === 'error');
    expect((app.coreLogger as any).fileTransport.level === 'info');
    expect((app.coreLogger as any).consoleTransport.level === 'error');
    expect(app.config.logger.disableConsoleAfterReady === false);
    await closeApp(app);
  });

  it('should got right config on unittest env', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_SERVER_ENV', 'unittest');
    mm(process.env, 'EGG_LOG', '');
    await remove(join(getFilepath('apps/mock-dev-app'), 'logs'));
    const app = await creatApp('apps/mock-dev-app');

    expect((app.logger as any).fileTransport.level === 'info');
    expect((app.logger as any).consoleTransport.level === 'warn');
    expect((app.coreLogger as any).fileTransport.level === 'info');
    expect((app.coreLogger as any).consoleTransport.level === 'warn');
    expect(app.config.logger.disableConsoleAfterReady === false);
    await closeApp(app);
  });

  it('should set log.consoleLevel to env.EGG_LOG', async () => {
    mm(process.env, 'EGG_LOG', 'ERROR');
    await remove(join(getFilepath('apps/mock-dev-app'), 'logs'));
    const app = await creatApp('apps/mock-dev-app');

    expect((app.logger as any).fileTransport.level === 'info');
    expect((app.logger as any).consoleTransport.level === 'error');
    await closeApp(app);
  });

  xit('log buffer disable cache on local and unittest env', async () => {
    mm(process.env, 'EGG_LOG', 'NONE');
    await remove(join(getFilepath('apps/nobuffer-logger'), 'logs'));
    const app = await creatApp('apps/nobuffer-logger');

    expect(app.config.logger.disableConsoleAfterReady === false);

    const ctx = app.mockContext();
    const logfile = join(app.config.logger.dir, 'common-error.log');
    // app.config.logger.buffer.should.equal(false);
    ctx.logger.error(new Error('mock nobuffer error'));

    await sleep(1000);

    expect(
      readFileSync(logfile, 'utf8').includes('nodejs.Error: mock nobuffer error\n')
    );
  });

  it('log buffer enable cache on non-local and non-unittest env', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', '');
    mm(process.env, 'EGG_LOG', 'none');
    mm(process.env, 'EGG_SERVER_ENV', 'prod');
    mm(process.env, 'EGG_HOME', getFilepath('apps/mock-production-app/src/config'));
    const app = await creatApp('apps/mock-production-app');

    expect(app.config.logger.disableConsoleAfterReady === true);
    const ctx = app.mockContext();
    const logfile = join(app.config.logger.dir, 'common-error.log');
    // app.config.logger.buffer.should.equal(true);
    ctx.logger.error(new Error('mock enable buffer error'));

    // await sleep(1000);
    console.log(logfile)
    expect(existsSync(logfile)).toBeTruthy();
    expect(readFileSync(logfile, 'utf8').includes(''));
    await closeApp(app);
  });

  // it('output .json format log', async () => {
  //   mm(process.env, 'EGG_LOG', 'none');
  //   mm.env('local');
  //   app = utils.app('apps/logger-output-json');
  //   await app.ready();
  //
  //   const ctx = app.mockContext();
  //   const logfile = path.join(app.config.logger.dir, 'logger-output-json-web.json.log');
  //   ctx.logger.info('json format');
  //
  //   await sleep(2000);
  //
  //   assert(fs.existsSync(logfile));
  //   assert(fs.readFileSync(logfile, 'utf8').includes('"message":"json format"'));
  // });
  //
  // it('dont output to console after app ready', done => {
  //   mm.env('default');
  //   app = utils.cluster('apps/logger');
  //   app
  //     .debug(false)
  //     .coverage(false)
  //     .expect('stdout', /agent info/)
  //     .expect('stdout', /app info/)
  //     .notExpect('stdout', /app info after ready/)
  //     .expect('stderr', /nodejs.Error: agent error/)
  //     .expect('stderr', /nodejs.Error: app error/)
  //     .end(done);
  // });
  //
  // it('should still output to console after app ready on local env', done => {
  //   mm.env('local');
  //   app = utils.cluster('apps/logger');
  //   app
  //     // .debug()
  //     .coverage(false)
  //     .expect('stdout', /agent info/)
  //     .expect('stdout', /app info/)
  //     .expect('stdout', /app info after ready/)
  //     .expect('stderr', /nodejs.Error: agent error/)
  //     .expect('stderr', /nodejs.Error: app error/)
  //     .end(done);
  // });
  //
  // it('agent and app error should output to common-error.log', done => {
  //   const baseDir = utils.getFilepath('apps/logger');
  //   mm.env('default');
  //   mm(process.env, 'EGG_LOG', 'none');
  //   mm(process.env, 'EGG_HOME', baseDir);
  //   app = utils.cluster('apps/logger');
  //   app
  //     // .debug()
  //     .coverage(false)
  //     .end(err => {
  //       assert(!err);
  //       const content = fs.readFileSync(path.join(baseDir, 'logs/logger/common-error.log'), 'utf8');
  //       assert(content.includes('nodejs.Error: agent error'));
  //       assert(content.includes('nodejs.Error: app error'));
  //       done();
  //     });
  // });
  //
  // it('all loggers error should redirect to errorLogger', async () => {
  //   app = utils.app('apps/logger');
  //   await app.ready();
  //
  //   app.logger.error(new Error('logger error'));
  //   app.coreLogger.error(new Error('coreLogger error'));
  //   app.loggers.errorLogger.error(new Error('errorLogger error'));
  //   app.loggers.customLogger.error(new Error('customLogger error'));
  //
  //   await sleep(1000);
  //
  //   const content = fs.readFileSync(path.join(app.baseDir, 'logs/logger/common-error.log'), 'utf8');
  //   assert(content.includes('nodejs.Error: logger error'));
  //   assert(content.includes('nodejs.Error: coreLogger error'));
  //   assert(content.includes('nodejs.Error: errorLogger error'));
  //   assert(content.includes('nodejs.Error: customLogger error'));
  // });
  //
  // it('agent\'s logger is same as coreLogger', async () => {
  //   app = utils.app('apps/logger');
  //   await app.ready();
  //
  //   assert(app.agent.logger.options.file === app.agent.coreLogger.options.file);
  // });
  //
  // describe('logger.level = DEBUG', () => {
  //   let app;
  //   beforeAll(() => {
  //     app = utils.app('apps/logger-level-debug');
  //     return app.ready();
  //   });
  //   afterAll(() => app.close());
  //
  //   it('should save debug log to file', done => {
  //     app.httpRequest()
  //       .get('/')
  //       .expect('ok')
  //       .end(err => {
  //         assert(!err);
  //         assert(
  //           fs.readFileSync(path.join(app.config.baseDir, 'logs/foo/foo-web.log'), 'utf8').includes(' DEBUG ')
  //         );
  //         done();
  //       });
  //   });
  // });
});
