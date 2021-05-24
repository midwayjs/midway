// fork from https://github.com/winstonjs/winston-daily-rotate-file v4.5.5

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as zlib from 'zlib';
import * as hash from 'object-hash';
import { MESSAGE } from 'triple-beam';
import { PassThrough } from 'stream';
import Transport = require('winston-transport');
import rotator = require('file-stream-rotator');
import { GeneralDailyRotateFileTransportOptions } from './interface';

const loggerDefaults = {
  json: false,
  colorize: false,
  eol: os.EOL,
  logstash: null,
  prettyPrint: false,
  label: null,
  stringify: false,
  depth: null,
  showLevel: true,
  timestamp: function () {
    return new Date().toISOString();
  },
};

const noop = function () {};

function isValidFileName(filename) {
  // eslint-disable-next-line no-control-regex
  return !/["<>|:*?\\/\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/g.test(
    filename
  );
}

function isValidDirName(dirname) {
  // eslint-disable-next-line no-control-regex
  return !/["<>|\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/g.test(
    dirname
  );
}

function getMaxSize(size) {
  if (size && typeof size === 'string') {
    const _s = size.toLowerCase().match(/^((?:0\.)?\d+)([k|m|g])$/);
    if (_s) {
      return size;
    }
  } else if (size && Number.isInteger(size)) {
    const sizeK = Math.round(size / 1024);
    return sizeK === 0 ? '1k' : sizeK + 'k';
  }

  return null;
}

function throwIf(options, ...args) {
  Array.prototype.slice.call(args, 1).forEach(name => {
    if (options[name]) {
      throw new Error('Cannot set ' + name + ' and ' + args[0] + ' together');
    }
  });
}

export class DailyRotateFileTransport extends Transport {
  options;
  logStream;
  name = 'dailyRotateFile';
  dirname: string;
  filename: string;

  constructor(options: GeneralDailyRotateFileTransportOptions = {}) {
    super(options);
    this.options = Object.assign({}, loggerDefaults, options);

    if (options.stream) {
      throwIf(options, 'stream', 'filename', 'maxsize');
      this.logStream = new PassThrough();
      this.logStream.pipe(options.stream);
    } else {
      this.filename = options.filename
        ? path.basename(options.filename)
        : 'winston.log';
      this.dirname = options.dirname || path.dirname(options.filename);

      if (!isValidFileName(this.filename) || !isValidDirName(this.dirname)) {
        throw new Error('Your path or filename contain an invalid character.');
      }

      this.logStream = rotator.getStream({
        filename: path.join(this.dirname, this.filename),
        frequency: options.frequency ? options.frequency : 'custom',
        date_format: options.datePattern ? options.datePattern : 'YYYY-MM-DD',
        verbose: false,
        size: getMaxSize(options.maxSize),
        max_logs: options.maxFiles,
        end_stream: true,
        audit_file: options.auditFile
          ? options.auditFile
          : path.join(this.dirname, '.' + hash(options) + '-audit.json'),
        file_options: options.options ? options.options : { flags: 'a' },
        utc: options.utc ? options.utc : false,
        extension: options.extension ? options.extension : '',
        create_symlink: options.createSymlink ? options.createSymlink : false,
        symlink_name: options.symlinkName ? options.symlinkName : 'current.log',
      });

      this.logStream.on('new', newFile => {
        this.emit('new', newFile);
      });

      this.logStream.on('rotate', (oldFile, newFile) => {
        this.emit('rotate', oldFile, newFile);
      });

      this.logStream.on('logRemoved', params => {
        if (options.zippedArchive) {
          const gzName = params.name + '.gz';
          if (fs.existsSync(gzName)) {
            try {
              fs.unlinkSync(gzName);
            } catch (_err) {
              // file is there but we got an error when trying to delete,
              // so permissions problem or concurrency issue and another
              // process already deleted it we could detect the concurrency
              // issue by checking err.type === ENOENT or EACCESS for
              // permissions ... but then?
            }
            this.emit('logRemoved', gzName);
            return;
          }
        }
        this.emit('logRemoved', params.name);
      });

      if (options.zippedArchive) {
        this.logStream.on('rotate', oldFile => {
          const oldFileExist = fs.existsSync(oldFile);
          const gzExist = fs.existsSync(oldFile + '.gz');
          if (!oldFileExist || gzExist) {
            return;
          }

          const gzip = zlib.createGzip();
          const inp = fs.createReadStream(oldFile);
          const out = fs.createWriteStream(oldFile + '.gz');
          inp
            .pipe(gzip)
            .pipe(out)
            .on('finish', () => {
              if (fs.existsSync(oldFile)) {
                fs.unlinkSync(oldFile);
              }
              this.emit('archive', oldFile + '.gz');
            });
        });
      }
    }
  }

  log(info, callback) {
    callback = callback || noop;

    this.logStream.write(info[MESSAGE] + this.options.eol);
    this.emit('logged', info);
    callback(null, true);
  }

  close() {
    if (this.logStream) {
      this.logStream.end(() => {
        this.emit('finish');
      });
    }
  }
}
