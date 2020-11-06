import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';

import { ServerlessLogger } from '../../src/lib/logger';
import { BaseLoggerFactory } from '../../src/lib/loggerFactory';

function sleep(sleepTime = 1000) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, sleepTime);
  });
}

describe('logger.test.ts', () => {
  describe('logger', () => {
    it('should log', async () => {
      const logger = new ServerlessLogger({});
      logger.write('hello', 'world');

      assert.deepEqual(logger.defaults, {
        file: null,
        encoding: 'utf8',
        level: 'INFO',
        consoleLevel: 'NONE',
        buffer: true,
      });
      await sleep(1000);
      logger.close();
    });

    it('should logger with file', async () => {
      const logger = new ServerlessLogger({
        file: path.join(os.tmpdir(), 'test.log'),
      });
      logger.write('hello');
      await sleep(1000);
      logger.close();
    });

    it('should do logger file clear without no op', async () => {
      class MyLogger extends ServerlessLogger {
        test() {
          this.options.fileClearInterval = 10;
          this.rotateLogBySize();
        }
      }
      const logger = new MyLogger({
        file: path.join(os.tmpdir(), 'test.log'),
        level: 'ALL',
      });
      logger.write('hello, world!');
      logger.test();
      await sleep(1000);
      logger.close();
    });

    it('should do logger file clear', async () => {
      class MyLogger extends ServerlessLogger {
        test() {
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          this.rotateLogBySize();
        }
      }
      const logger = new MyLogger({
        file: path.join(os.tmpdir(), 'test.log'),
        level: 'INFO',
      });
      logger.write('hello, world!');
      logger.test();
      await sleep(1000);
      logger.close();
    });

    it('should do logger file clear without log file', async () => {
      class MyLogger extends ServerlessLogger {
        test() {
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          this.rotateLogBySize();
        }
      }
      const logger = new MyLogger({
        level: 'INFO',
      });
      logger.write('hello, world!');
      logger.test();
      await sleep(1000);
      logger.close();
    });

    it('should do logger rotateBySize without log file', async () => {
      class MyLogger extends ServerlessLogger {
        test() {
          this.options.file = '';
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          this.rotateBySize();
        }
      }
      const logger = new MyLogger({
        level: 'INFO',
      });
      logger.write('hello, world!');
      logger.test();
      await sleep(1000);
      logger.close();
    });

    it('should do logger renameOrDelete without log file', async () => {
      class MyLogger extends ServerlessLogger {
        test() {
          this.options.file = '';
          this.options.fileClearInterval = 10;
          this.options.maxFileSize = 5;
          this.renameOrDelete('', '');
        }
      }
      const logger = new MyLogger({
        level: 'INFO',
      });
      logger.write('hello, world!');
      logger.test();
      await sleep(1000);
      logger.close();
    });
  });

  describe('loggerFactory', () => {
    it('should new loggerFactory', async () => {
      const loggerFactory = new BaseLoggerFactory(__dirname);
      const logger = loggerFactory.createLogger({
        file: path.join(__dirname, 'fixtures'),
      });
      await sleep(1000);
      logger.close();
    });
  });
});
