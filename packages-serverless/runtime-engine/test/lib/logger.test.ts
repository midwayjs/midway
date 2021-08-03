import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import { ServerlessLogger, BaseLoggerFactory } from '../../src';

describe('logger.test.ts', () => {
  describe('logger', () => {
    it('should log', () => {
      const logger = new ServerlessLogger({});
      logger.write('hello', 'world');

      assert.deepEqual(logger.defaults, {
        file: null,
        encoding: 'utf8',
        level: 'INFO',
        consoleLevel: 'NONE',
        buffer: true,
      });
      logger.close();
    });

    it('should logger with file', () => {
      const logger = new ServerlessLogger({
        file: path.join(os.tmpdir(), 'test.log'),
      });
      logger.write('hello');
      logger.close();
    });

    it('should do logger file clear without no op', async () => {
      class MyLogger extends ServerlessLogger {
        async test() {
          this.options.fileClearInterval = 10;
          await this.rotateLogBySize();
        }
      }
      const logger = new MyLogger({
        file: path.join(os.tmpdir(), 'test.log'),
        level: 'ALL',
      });
      logger.write('hello, world!');
      await logger.test();
      logger.close();
    });

    it('should do logger file clear', async () => {
      class MyLogger extends ServerlessLogger {
        async test() {
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          await this.rotateLogBySize();
        }
      }
      const logger = new MyLogger({
        file: path.join(os.tmpdir(), 'test.log'),
        level: 'INFO',
      });
      logger.write('hello, world!');
      await logger.test();
      logger.close();
    });

    it('should do logger file clear without log file', async () => {
      class MyLogger extends ServerlessLogger {
        async test() {
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          await this.rotateLogBySize();
        }
      }
      const logger = new MyLogger({
        level: 'INFO',
      });
      logger.write('hello, world!');
      await logger.test();
      logger.close();
    });

    it('should do logger rotateBySize without log file', async () => {
      class MyLogger extends ServerlessLogger {
        async  test() {
          this.options.file = '';
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          await this.rotateBySize();
        }
      }
      const logger = new MyLogger({
        level: 'INFO',
      });
      logger.write('hello, world!');
      await logger.test();
      logger.close();
    });

    it('should do logger renameOrDelete without log file', async () => {
      class MyLogger extends ServerlessLogger {
        async test() {
          this.options.file = '';
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          await this.renameOrDelete('', '');
        }
      }
      const logger = new MyLogger({
        level: 'INFO',
      });
      logger.write('hello, world!');
      await logger.test();
      logger.close();
    });
  });

  describe('loggerFactory', () => {
    it('should new loggerFactory', () => {
      const loggerFactory = new BaseLoggerFactory(__dirname);
      const logger = loggerFactory.createLogger({
        file: path.join(__dirname, 'fixtures'),
      });
      logger.close();
    });
  });

  describe('logger benchmark', () => {
    it('logger benchmark should be ok', async () => {
      const loggerFactory = new BaseLoggerFactory(__dirname);
      const log = (loggerFactory as any).createLogger(path.join(__dirname, '_benchmarks/test.log'), {
        fileClearInterval: 100,
        maxFileSize: 1,
        maxFiles: 2,
      });

      for (let i = 0; i < 100000; i++) {
        log.info('asjdfaoj230u4u9rpasdjfasjdfpoaiweurpoqwurapsjf;lasdjfopasiefpoqwuerpoajsdpfjasdjfa;lsdjfaosdfjpawierpqoiwe ==> i = %s', i);
        log.error('asjdfaoj230u4u9rpasdjfasjdfpoaiweurpoqwurapsjf;lasdjfopasiefpoqwuerpoajsdpfjasdjfa;lsdjfaosdfjpawierpqoiwe ==> i = %s', i);

        // await new Promise<void>(resolve => {
        //   setTimeout(() => resolve(), 50);
        // });
      }
      log.close();
    });
  });
});
