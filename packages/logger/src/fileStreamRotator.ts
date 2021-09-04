// fork from https://github.com/rogerc/file-stream-rotator/blob/master/FileStreamRotator.js v0.5.7

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as EventEmitter from 'events';
import { format, debuglog } from 'util';
import * as moment from 'moment';
import * as assert from 'assert';
import { debounce } from './util';

const debug = debuglog('midway-logger');
const staticFrequency = ['daily', 'test', 's', 'm', 'h', 'custom'];
const DATE_FORMAT = 'YYYYMMDDHHmm';

/**
 * Returns frequency metadata for minute/hour rotation
 * @param type
 * @param num
 * @returns {*}
 * @private
 */
const checkNumAndType = function (type, num) {
  if (typeof num === 'number') {
    switch (type) {
      case 's':
      case 'm':
        if (num < 0 || num > 60) {
          return false;
        }
        break;
      case 'h':
        if (num < 0 || num > 24) {
          return false;
        }
        break;
    }
    return { type: type, digit: num };
  }
};

/**
 * Returns frequency metadata for defined frequency
 * @param freqType
 * @returns {*}
 * @private
 */
const _checkDailyAndTest = function (freqType) {
  switch (freqType) {
    case 'custom':
    case 'daily':
      return { type: freqType, digit: undefined };
    case 'test':
      return { type: freqType, digit: 0 };
  }
  return false;
};

/**
 * Removes old log file
 * @param file
 * @param file.hash
 * @param file.name
 * @param file.date
 */
function removeFile(file) {
  if (
    file.hash ===
    crypto
      .createHash('md5')
      .update(file.name + 'LOG_FILE' + file.date)
      .digest('hex')
  ) {
    try {
      if (fs.existsSync(file.name)) {
        fs.unlinkSync(file.name);
      }
    } catch (e) {
      debug(
        new Date().toLocaleString(),
        '[FileStreamRotator] Could not remove old log file: ',
        file.name
      );
    }
  }
}

/**
 * Create symbolic link to current log file
 * @param {String} logfile
 * @param {String} name Name to use for symbolic link
 */
function createCurrentSymLink(logfile, name) {
  const symLinkName = name || 'current.log';
  const logPath = path.dirname(logfile);
  const logfileName = path.basename(logfile);
  const current = logPath + '/' + symLinkName;
  try {
    const stats = fs.lstatSync(current);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(current);
      fs.symlinkSync(logfileName, current);
    }
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      try {
        fs.symlinkSync(logfileName, current);
      } catch (e) {
        debug(
          new Date().toLocaleString(),
          '[FileStreamRotator] Could not create symlink file: ',
          current,
          ' -> ',
          logfileName
        );
      }
    }
  }
}

/**
 * Check and make parent directory
 * @param pathWithFile
 */
const mkDirForFile = function (pathWithFile) {
  const _path = path.dirname(pathWithFile);
  _path.split(path.sep).reduce((fullPath, folder) => {
    fullPath += folder + path.sep;
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
    return fullPath;
  }, '');
};

/**
 * Bubbles events to the proxy
 * @param emitter
 * @param proxy
 * @constructor
 */
function BubbleEvents(emitter, proxy) {
  emitter.on('close', () => {
    proxy.emit('close');
  });
  emitter.on('finish', () => {
    proxy.emit('finish');
  });
  emitter.on('error', err => {
    proxy.emit('error', err);
  });
  emitter.on('open', fd => {
    proxy.emit('open', fd);
  });
}

export class FileStreamRotator {
  /**
   * Returns frequency metadata
   * @param frequency
   * @returns {*}
   */
  getFrequency(frequency) {
    const f = frequency.toLowerCase().match(/^(\d+)([smh])$/);
    if (f) {
      return checkNumAndType(f[2], parseInt(f[1]));
    }

    const dailyOrTest = _checkDailyAndTest(frequency);
    if (dailyOrTest) {
      return dailyOrTest;
    }

    return false;
  }

  /**
   * Returns a number based on the option string
   * @param size
   * @returns {Number}
   */
  parseFileSize(size) {
    if (size && typeof size === 'string') {
      const _s: any = size.toLowerCase().match(/^((?:0\.)?\d+)([kmg])$/);
      if (_s) {
        switch (_s[2]) {
          case 'k':
            return _s[1] * 1024;
          case 'm':
            return _s[1] * 1024 * 1024;
          case 'g':
            return _s[1] * 1024 * 1024 * 1024;
        }
      }
    }
    return null;
  }

  /**
   * Returns date string for a given format / date_format
   * @param format
   * @param date_format
   * @param {boolean} utc
   * @returns {string}
   */
  getDate(format, date_format, utc) {
    date_format = date_format || DATE_FORMAT;
    const currentMoment = utc ? moment.utc() : moment().local();
    if (format && staticFrequency.indexOf(format.type) !== -1) {
      switch (format.type) {
        case 's':
          /*eslint-disable-next-line no-case-declarations*/
          const second =
            Math.floor(currentMoment.seconds() / format.digit) * format.digit;
          return currentMoment.seconds(second).format(date_format);
        case 'm':
          /*eslint-disable-next-line no-case-declarations*/
          const minute =
            Math.floor(currentMoment.minutes() / format.digit) * format.digit;
          return currentMoment.minutes(minute).format(date_format);
        case 'h':
          /*eslint-disable-next-line no-case-declarations*/
          const hour =
            Math.floor(currentMoment.hour() / format.digit) * format.digit;
          return currentMoment.hour(hour).format(date_format);
        case 'daily':
        case 'custom':
        case 'test':
          return currentMoment.format(date_format);
      }
    }
    return currentMoment.format(date_format);
  }

  /**
   * Read audit json object from disk or return new object or null
   * @param max_logs
   * @param audit_file
   * @param log_file
   * @returns {Object} auditLogSettings
   * @property {Object} auditLogSettings.keep
   * @property {Boolean} auditLogSettings.keep.days
   * @property {Number} auditLogSettings.keep.amount
   * @property {String} auditLogSettings.auditLog
   * @property {Array} auditLogSettings.files
   */
  setAuditLog(max_logs, audit_file, log_file) {
    let _rtn = null;
    if (max_logs) {
      const use_days = max_logs.toString().substr(-1);
      const _num = max_logs.toString().match(/^(\d+)/);

      if (Number(_num[1]) > 0) {
        const baseLog = path.dirname(log_file.replace(/%DATE%.+/, '_filename'));
        try {
          if (audit_file) {
            const full_path = path.resolve(audit_file);
            _rtn = JSON.parse(
              fs.readFileSync(full_path, { encoding: 'utf-8' })
            );
          } else {
            const full_path = path.resolve(baseLog + '/' + '.audit.json');
            _rtn = JSON.parse(
              fs.readFileSync(full_path, { encoding: 'utf-8' })
            );
          }
        } catch (e) {
          if (e.code !== 'ENOENT') {
            return null;
          }
          _rtn = {
            keep: {
              days: false,
              amount: Number(_num[1]),
            },
            auditLog: audit_file || baseLog + '/' + '.audit.json',
            files: [],
          };
        }

        _rtn.keep = {
          days: use_days === 'd',
          amount: Number(_num[1]),
        };
      }
    }
    return _rtn;
  }

  /**
   * Write audit json object to disk
   * @param {Object} audit
   * @param {Object} audit.keep
   * @param {Boolean} audit.keep.days
   * @param {Number} audit.keep.amount
   * @param {String} audit.auditLog
   * @param {Array} audit.files
   */
  writeAuditLog(audit) {
    try {
      mkDirForFile(audit.auditLog);
      fs.writeFileSync(audit.auditLog, JSON.stringify(audit, null, 4));
    } catch (e) {
      debug(
        new Date().toLocaleString(),
        '[FileStreamRotator] Failed to store log audit at:',
        audit.auditLog,
        'Error:',
        e
      );
    }
  }

  /**
   * Write audit json object to disk
   * @param {String} logfile
   * @param {Object} audit
   * @param {Object} audit.keep
   * @param {Boolean} audit.keep.days
   * @param {Number} audit.keep.amount
   * @param {String} audit.auditLog
   * @param {Array} audit.files
   * @param {EventEmitter} stream
   */
  addLogToAudit(logfile, audit, stream) {
    if (audit && audit.files) {
      // Based on contribution by @nickbug - https://github.com/nickbug
      const index = audit.files.findIndex(file => {
        return file.name === logfile;
      });
      if (index !== -1) {
        // nothing to do as entry already exists.
        return audit;
      }
      const time = Date.now();
      audit.files.push({
        date: time,
        name: logfile,
        hash: crypto
          .createHash('md5')
          .update(logfile + 'LOG_FILE' + time)
          .digest('hex'),
      });

      if (audit.keep.days) {
        const oldestDate = moment()
          .subtract(audit.keep.amount, 'days')
          .valueOf();
        const recentFiles = audit.files.filter(file => {
          if (file.date > oldestDate) {
            return true;
          }
          removeFile(file);
          stream.emit('logRemoved', file);
          return false;
        });
        audit.files = recentFiles;
      } else {
        const filesToKeep = audit.files.splice(-audit.keep.amount);
        if (audit.files.length > 0) {
          audit.files.filter(file => {
            removeFile(file);
            stream.emit('logRemoved', file);
            return false;
          });
        }
        audit.files = filesToKeep;
      }

      this.writeAuditLog(audit);
    }

    return audit;
  }

  /**
   *
   * @param options
   * @param options.filename
   * @param options.frequency
   * @param options.date_format
   * @param options.size
   * @param options.max_logs
   * @param options.audit_file
   * @param options.file_options
   * @param options.utc
   * @param options.extension File extension to be added at the end of the filename
   * @param options.create_symlink
   * @param options.symlink_name
   * @returns {Object} stream
   */
  getStream(options: {
    filename: string;
    frequency?: string;
    size?: string;
    max_logs?: number | string;
    end_stream?: boolean;
    extension?: string;
    create_symlink?: boolean;
    date_format?: string;
    audit_file?: string;
    symlink_name?: string;
    utc?: boolean;
    file_options?: any;
  }) {
    let frequencyMetaData = null;
    let curDate = null;

    assert(options.filename, 'options.filename must be supplied');

    if (options.frequency) {
      frequencyMetaData = this.getFrequency(options.frequency);
    }

    const auditLog = this.setAuditLog(
      options.max_logs,
      options.audit_file,
      options.filename
    );

    let fileSize = null;
    let fileCount = 0;
    let curSize = 0;
    if (options.size) {
      fileSize = this.parseFileSize(options.size);
    }

    let dateFormat = options.date_format || DATE_FORMAT;
    if (frequencyMetaData && frequencyMetaData.type === 'daily') {
      if (!options.date_format) {
        dateFormat = 'YYYY-MM-DD';
      }
      if (
        moment().format(dateFormat) !==
          moment().endOf('day').format(dateFormat) ||
        moment().format(dateFormat) ===
          moment().add(1, 'day').format(dateFormat)
      ) {
        debug(
          new Date().toLocaleString(),
          '[FileStreamRotator] Changing type to custom as date format changes more often than once a day or not every day'
        );
        frequencyMetaData.type = 'custom';
      }
    }

    if (frequencyMetaData) {
      curDate = options.frequency
        ? this.getDate(frequencyMetaData, dateFormat, options.utc)
        : '';
    }

    options.create_symlink = options.create_symlink || false;
    options.extension = options.extension || '';
    const filename = options.filename;
    let oldFile = null;
    let logfile = filename + (curDate ? '.' + curDate : '');
    if (filename.match(/%DATE%/)) {
      logfile = filename.replace(
        /%DATE%/g,
        curDate ? curDate : this.getDate(null, dateFormat, options.utc)
      );
    }

    if (fileSize) {
      // 下面应该是启动找到已经创建了的文件，做一些预先处理，比如找到最新的那个文件，方便写入
      let lastLogFile = null;
      let t_log = logfile;
      if (
        auditLog &&
        auditLog.files &&
        auditLog.files instanceof Array &&
        auditLog.files.length > 0
      ) {
        const lastEntry = auditLog.files[auditLog.files.length - 1].name;
        if (lastEntry.match(t_log)) {
          const lastCount = lastEntry.match(t_log + '\\.(\\d+)');
          // Thanks for the PR contribution from @andrefarzat - https://github.com/andrefarzat
          if (lastCount) {
            t_log = lastEntry;
            fileCount = lastCount[1];
          }
        }
      }

      if (fileCount === 0 && t_log === logfile) {
        t_log += options.extension;
      }

      // 计数，找到数字最大的那个日志文件
      while (fs.existsSync(t_log)) {
        lastLogFile = t_log;
        fileCount++;
        t_log = logfile + '.' + fileCount + options.extension;
      }
      if (lastLogFile) {
        const lastLogFileStats = fs.statSync(lastLogFile);
        // 看看最新的那个日志有没有超过设置的大小
        if (lastLogFileStats.size < fileSize) {
          // 没有超，把新文件退栈
          t_log = lastLogFile;
          fileCount--;
          curSize = lastLogFileStats.size;
        }
      }
      logfile = t_log;
    } else {
      logfile += options.extension;
    }

    debug(
      new Date().toLocaleString(),
      '[FileStreamRotator] Logging to: ',
      logfile
    );

    // 循环创建目录和文件，类似 mkdirp
    mkDirForFile(logfile);

    const file_options = options.file_options || { flags: 'a' };
    // 创建文件流
    let rotateStream = fs.createWriteStream(logfile, file_options);
    if (
      (curDate &&
        frequencyMetaData &&
        staticFrequency.indexOf(frequencyMetaData.type) > -1) ||
      fileSize > 0
    ) {
      debug(
        new Date().toLocaleString(),
        '[FileStreamRotator] Rotating file: ',
        frequencyMetaData ? frequencyMetaData.type : '',
        fileSize ? 'size: ' + fileSize : ''
      );

      // 这里用了一个事件代理，方便代理的内容做处理
      const stream: any = new EventEmitter();
      stream.auditLog = auditLog;
      stream.end = (...args) => {
        rotateStream.end(...args);
        resetCurLogSize.clear();
      };
      BubbleEvents(rotateStream, stream);

      stream.on('new', newLog => {
        // 创建审计的日志，记录最新的日志文件，切割的记录等
        stream.auditLog = this.addLogToAudit(newLog, stream.auditLog, stream);
        // 创建软链
        if (options.create_symlink) {
          createCurrentSymLink(newLog, options.symlink_name);
        }
      });

      // 这里采用 1s 的防抖，避免过于频繁的获取文件大小
      const resetCurLogSize = debounce(() => {
        const lastLogFileStats = fs.statSync(logfile);
        if (lastLogFileStats.size > curSize) {
          curSize = lastLogFileStats.size;
        }
      }, 1000);

      stream.write = (str, encoding) => {
        resetCurLogSize();
        const newDate = this.getDate(
          frequencyMetaData,
          dateFormat,
          options.utc
        );
        if (
          (curDate && newDate !== curDate) ||
          (fileSize && curSize > fileSize)
        ) {
          let newLogfile = filename + (curDate ? '.' + newDate : '');
          if (filename.match(/%DATE%/) && curDate) {
            newLogfile = filename.replace(/%DATE%/g, newDate);
          }

          if (fileSize && curSize > fileSize) {
            fileCount++;
            newLogfile += '.' + fileCount + options.extension;
          } else {
            // reset file count
            fileCount = 0;
            newLogfile += options.extension;
          }
          curSize = 0;

          debug(
            new Date().toLocaleString(),
            format(
              '[FileStreamRotator] Changing logs from %s to %s',
              logfile,
              newLogfile
            )
          );
          curDate = newDate;
          oldFile = logfile;
          logfile = newLogfile;
          // Thanks to @mattberther https://github.com/mattberther for raising it again.
          if (options.end_stream === true) {
            rotateStream.end();
          } else {
            rotateStream.destroy();
          }

          mkDirForFile(logfile);

          rotateStream = fs.createWriteStream(newLogfile, file_options);
          stream.emit('new', newLogfile);
          stream.emit('rotate', oldFile, newLogfile);
          BubbleEvents(rotateStream, stream);
        }
        rotateStream.write(str, encoding);
        // Handle length of double-byte characters
        curSize += Buffer.byteLength(str, encoding);
      };
      process.nextTick(() => {
        stream.emit('new', logfile);
      });
      stream.emit('new', logfile);
      return stream;
    } else {
      debug(
        new Date().toLocaleString(),
        "[FileStreamRotator] File won't be rotated: ",
        options.frequency,
        options.size
      );
      process.nextTick(() => {
        rotateStream.emit('new', logfile);
      });
      return rotateStream;
    }
  }
}
