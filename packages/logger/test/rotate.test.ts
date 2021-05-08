import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import * as rimraf from 'rimraf';
import * as dayjs from 'dayjs';

import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

import { DailyRotateFileTransport as DailyRotateFile } from '../src/rotate';
import { MemoryStream } from './memory-stream';
import { randomString } from './random-string';

function sendLogItem(transport, level, message, meta?, cb?) {
  const logger = winston.createLogger({
    transports: [transport]
  });

  transport.on('logged', function () {
    if (cb) {
      cb(null, true);
    }
  });

  logger.info({
    level: level,
    message: message
  });
}

describe('winston/transports/daily-rotate-file', function () {

  let transport;
  let stream;

  beforeEach(function () {
    stream = new MemoryStream();
    transport = new DailyRotateFile({
      json: true,
      stream,
    });
  });

  it('should have the proper methods defined', function () {
    const transport = new DailyRotateFile({stream: new MemoryStream()});
    expect(transport).toBeInstanceOf(DailyRotateFile);
    expect(transport['log']).toBeDefined();
  });

  it('should not allow invalid characters in the filename', function () {
    expect(function () {
      // eslint-disable-next-line no-new
      new DailyRotateFile({
        filename: 'test\0log.log'
      });
    }).toThrow();
  });

  it('should not allow invalid characters in the dirname', function () {
    expect(function () {
      // eslint-disable-next-line no-new
      new DailyRotateFile({
        dirname: 'C:\\application<logs>',
        filename: 'test_%DATE%.log'
      });
    }).toThrow();
  });

  it('should write to the stream', function (done) {
    sendLogItem(transport, 'info', 'this message should write to the stream', {}, (err, logged) => {
      expect(err).toBeNull();
      expect(logged).toBeTruthy();
      const logEntry = JSON.parse(stream.toString());
      expect(logEntry.level).toEqual('info')
      expect(logEntry.message).toEqual('this message should write to the stream');
      done();
    });
  });

  describe('when passed metadata', function () {
    const circular = {} as any;
    circular.metadata = circular;

    const params = {
      no: {},
      object: {metadata: true},
      primitive: 'metadata',
      circular: circular
    };

    Object.keys(params).forEach(function (param) {
      it('should accept log messages with ' + param + ' metadata', function (done) {
        sendLogItem(transport, 'info', 'test log message', params[param], function (err, logged) {
          expect(err).toBeNull();
          expect(logged).toBeTruthy();
          // TODO parse the metadata value to make sure its set properly
          done();
        });
      });
    });
  });

  describe('when using a filename or dirname', function () {
    const logDir = path.join(__dirname, 'logs');
    const now = dayjs().utc().format('YYYY-MM-DD-HH');
    const filename = path.join(logDir, 'application-' + now + '.testlog');
    const options = {
      json: true,
      dirname: logDir,
      filename: 'application-%DATE%',
      datePattern: 'YYYY-MM-DD-HH',
      utc: true,
      extension: '.testlog'
    };

    beforeEach(function (done) {
      rimraf(logDir, () => {
        transport = new DailyRotateFile(options);
        done();
      });
    });

    it('should write to the file', function (done) {
      transport.on('finish', function () {
        const logEntries = fs.readFileSync(filename).toString().split('\n').slice(0, -1);
        expect(logEntries.length).toEqual(1);

        const logEntry = JSON.parse(logEntries[0]);
        expect(logEntry.level).toEqual('info');
        expect(logEntry.message).toEqual('this message should write to the file');
        done();
      });

      sendLogItem(transport, 'info', 'this message should write to the file', {}, function (err, logged) {
        expect(err).toBeNull();
        expect(logged).toBeTruthy();
      });

      transport.close();
    });

    it('should not allow the stream to be set', function () {
      const opts: any = Object.assign({}, options);
      opts.stream = new MemoryStream();
      expect(function () {
        const transport = new DailyRotateFile(opts);
        expect(transport).not.toBeNull();
      }).toThrow();
    });

    it.skip('should raise the new event for a new log file', function (done) {
      transport.on('new', function (newFile) {
        expect(newFile).toEqual(filename);
        done();
      });

      sendLogItem(transport, 'info', 'this message should write to the file');
      transport.close();
    });

    it('should raise the logRemoved event when pruning old log files', function (done) {
      const opts: any = Object.assign({}, options);
      opts.maxSize = '1k';
      opts.maxFiles = 1;

      transport = new DailyRotateFile(opts);

      transport.on('logRemoved', function (removedFilename) {
        expect(removedFilename).toEqual(filename);
        done();
      });

      sendLogItem(transport, 'info', randomString(1056));
      sendLogItem(transport, 'info', randomString(1056));
      transport.close();
    });
  });
});
